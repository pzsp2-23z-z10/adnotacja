const mongoose = require('mongoose');
const outer_connections = require('./outer_connections.js')

const { Genotype } = require('./models/genotype.js');
const { getEmptyProgress,CalculationProgress,ServiceStatus } = require('./models/calculation.js');


async function initServices(services){
  console.log("Initialising db")
  // creates entries for each service
  for (const [name, value] of Object.entries(services)){
    let service = await ServiceStatus.exists({ service_id: name })
    //console.log(name+" exists? : "+service)
    if (!service){
      console.log("Adding new service to databse: "+name)
      let a = new ServiceStatus({service_id:name,active_token:"token"})
      a.save();
    }
  
  }
}

async function isServiceBusy(name){
  let service = await ServiceStatus.findOne({ service_id: name })
  return service.active_token!=undefined;
}

async function setServiceStatus(name, status){
  // if status==undefined, then service is free
  let service = await ServiceStatus.findOne({ service_id: name })
  service.active_token=status;

}

async function getAnalysis(id){
	
	console.log("Somebody asked for analysis id:",id)
	let progress = await getCalculationProgress(id);
	console.log(progress)
	if (progress===null)
	{
		console.log("this token is not in database.")
		return {error:"Unknown token"}
	}
	else if (Object.values(progress.progress).includes(false))
	{
		console.log("Analysis is not finished.")
		return {status:"Not_ready"}
	}
	return {
  "id": 123,
  "Wyniki": [
    {
      "name": "SPiP",
      "result": [
        {
          "CHROM": "chr1",
          "POS": 15765825,
          "ID": "NM_007272:g.15765825:G>A",
          "REF": "G",
          "ALT": "A",
          "QUAL": ".",
          "FILTER": ".",
          "INFO": "SPiP=A|NTR|00.04 % [00.02 % ; 00.08%]|+|substitution|G>A|Intron 1 (1795)|NM_007272|CTRC|donor|825|DeepIntron|0|Outside SPiCE Interpretation|0|No|NA|15765816|Acc|0.00206159394907144|No|Don|15765000|816|15765816|0.00161527498798199|No|15766795|0.0775463330795674|Yes|0.0775463330795674|Yes"
        }
      ]
    }
  ]
}
}

async function makeAnalysis(data){

	//@TODO check if valid
	console.log("Starting analysis:",data.path);
  try {
  var lines = await parseStreamByLines(data);
  } catch (error) {
    console.error("Error:", error);
  }
  var header = ""
  for(let line of lines){
    if (line.slice(0,2) != '##') {
      header = line.slice(1,line.length);
      break;
    }
  };
  var column_names = header.split(/[\s,\t]+/)
  var column_positions = [column_names.indexOf('CHROM'), column_names.indexOf('POS'), column_names.indexOf('REF'), column_names.indexOf('ALT')]
  var results = await findLinesInDb(lines, column_positions)
  console.log("Have results: ")
  console.log(results.have_results)
	// here will be some concurrent action, request is scheduled and token is returned
	outer_connections.requestCalculation(results.no_results)
	const token = Math.floor(new Date().getTime() / 1000)
	addCalculationProgress({"token":token,progress:[false]});
	setTimeout(()=> {
		//symulacja tego, że dane są gotowe
		modifyCalculationProgress(token,[true]);
		console.log("!!! Analysis done for token",token)
	}, 10000);
	return token;
  
async function addAnalysis(token, services){
	addCalculationProgress({"token":token,progress:getEmptyProgress(services)});
}

function parseStreamByLines(data) {
  return new Promise((resolve, reject) => {
  var stream = require('stream'); 
  var xtream = new stream.Transform( { objectMode: true } );

  xtream._transform = function(chunk, encoding, done) {
    var strData = chunk.toString();

    if (this._invalidLine) {
      strData = this._invalidLine + strData;
    };

    var objLines = strData.split("\n"); 
    this._invalidLine = objLines.splice(objLines.length-1, 1)[0];  
    this.push(objLines);

    done();
  };

  xtream._flush = function(done) {
    if (this._invalidLine) {   
      this.push([this._invalidLine]); 
    };

    this._invalidLine = null;
    done();
  };
  
  var all_lines = [];
  data.pipe(xtream);
  xtream.on('readable', function(){ 
    while (lines = xtream.read()) { 
      lines.forEach(function(line, index){
        all_lines.push(line);
      });   
    }
    xtream.on('end', function () {
      resolve(all_lines);
    });

    xtream.on('error', function (err) {
      reject(err);
    });
  });
  });
}

async function findLinesInDb(lines, column_positions) {
  var have_results = [];
  var no_results = [];

  var promises = lines.map(async function (line) {
    if (line[0] != '#') {
      var elements = line.split(/[\s\t,]+/);
      var values = [elements[column_positions[0]], elements[column_positions[1]], elements[column_positions[2]], elements[column_positions[3]]];

      var genotype = await getGenotype(values[0], values[1], values[2], values[3]);

      if (genotype.length != 0) {
        console.log("Found in db: " + line);
        var all_results = '';
        for (let i = 0; i < genotype.length; i++) {
          genotype[i].result.forEach((nestedItem) => {
            all_results += nestedItem.name + " " + nestedItem.value + " "
          });
        }
        console.log('All results ');
        console.log(all_results)
        have_results.push(line + all_results);
      } else {
        no_results.push(line);
      }
    }
  });

  await Promise.all(promises);

  return { have_results, no_results };
}
async function addGenotype(chr, pos, ref, alt, result) {
    let gen = new Genotype({
        chr : chr,
        pos : pos, 
        ref : ref,
        alt : alt, 
        result : result       
    });
    console.log("Saving new genotype:", gen);
    gen.save();
}

async function getGenotype(chr, pos, ref, alt) {
  return Genotype.find({$and:[{"chr":chr}, {"pos":pos}, {"ref":ref}, {"alt":alt}]})
}
async function addCalculationProgress(progress) {
    let state = new CalculationProgress (progress);
    console.log("Saving new calculation progress", state);
    state.save();
}

async function getCalculationProgress(token) {
    return CalculationProgress.findOne({"token":token})
}

async function modifyCalculationProgress(token, newProgress) {
    CalculationProgress.findOneAndUpdate({"token":token}, 
        {$set:{progress: newProgress}}, {new:true}
    )
    .then(updatedRecord => {
        if (updatedRecord==null){
          console.error("calculation progress for "+token+" not found!")
        }
        else{
          console.log("Successfully updated record", updatedRecord);

        }
    })
    .catch(err=>{
        console.error(err);
    })
}



module.exports = {setServiceStatus, isServiceBusy,initServices,getAnalysis, makeAnalysis, addGenotype, addCalculationProgress,modifyCalculationProgress, getCalculationProgress, getGenotype}
