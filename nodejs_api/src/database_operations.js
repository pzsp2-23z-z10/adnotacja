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
      let a = new ServiceStatus({service_id:name,active_token:"free"})
      a.save();
    }
    else{
      //!!!!!!! THIS CLEARS STATUES ON RESTART, MAYBE NOT GOOD !!!!!!
      console.log("Clearing services' statuses")
      await ServiceStatus.findOneAndUpdate({ service_id: name }, {$set:{active_token:"free"}})
    }
  
  }
}

async function isServiceBusy(name){
  console.log("isb")
  let service = await ServiceStatus.findOne({ service_id: name })
  console.log("service '",name,"' status:",service)
  console.log("busy?",service.active_token!="free")
  return service.active_token!="free";
}

async function setServiceStatus(name, status){
  console.log("set service",name,"to status",status=="free"?"free":status+" (busy)")
  // if status==undefined, then service is free
  let service = await ServiceStatus.findOneAndUpdate({ service_id: name }, {$set:{active_token:status}})
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
  
async function addAnalysis(token, services){
	addCalculationProgress({"token":token,progress:getEmptyProgress(services)});
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

module.exports = {findLinesInDb, setServiceStatus, isServiceBusy,initServices,getAnalysis, addAnalysis, addGenotype, addCalculationProgress,modifyCalculationProgress, getCalculationProgress, getGenotype}
