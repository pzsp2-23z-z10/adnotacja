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
      console.log("Clearing service status:",name)
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
  
  console.log("Data ready")

  table_data = {"id":id,"results":{}}

  for ( x of Object.keys(progress.progress)){
    table_data["results"][x]=[{
      "CHROM": "chr1",
      "POS": 15765825,
      "ID": "NM_007272:g.15765825:G>A",
      "REF": "G",
      "ALT": "A",
      "QUAL": ".",
      "FILTER": ".",
      "INFO": "SPiP=A|NTR|00.04 % [00.02 % ; 00.08%]|+|substitution|G>A|Intron 1 (1795)|NM_007272|CTRC|donor|825|DeepIntron|0|Outside SPiCE Interpretation|0|No|NA|15765816|Acc|0.00206159394907144|No|Don|15765000|816|15765816|0.00161527498798199|No|15766795|0.0775463330795674|Yes|0.0775463330795674|Yes"
    },{
      "CHROM": "chr1",
      "POS": 15765825,
      "ID": "NM_007272:g.15765825:G>A",
      "REF": "G",
      "ALT": "A",
      "QUAL": ".",
      "FILTER": ".",
      "INFO": "SPiP=A|NTR|00.04 % [00.02 % ; 00.08%]|+|substitution|G>A|Intron 1 (1795)|NM_007272|CTRC|donor|825|DeepIntron|0|Outside SPiCE Interpretation|0|No|NA|15765816|Acc|0.00206159394907144|No|Don|15765000|816|15765816|0.00161527498798199|No|15766795|0.0775463330795674|Yes|0.0775463330795674|Yes"
    }]
  }

  table_data["results"]["pangolin"]=[{
    "CHROM": "chr1",
    "POS": 15765825,
    "ID": "NM_007272:g.15765825:G>A",
    "REF": "G",
    "ALT": "A",
    "QUAL": ".",
    "FILTER": ".",
    "INFO": "SPiP=A|NTR|00.04 % [00.02 % ; 00.08%]|+|substitution|G>A|Intron 1 (1795)|NM_007272|CTRC|donor|825|DeepIntron|0|Outside SPiCE Interpretation|0|No|NA|15765816|Acc|0.00206159394907144|No|Don|15765000|816|15765816|0.00161527498798199|No|15766795|0.0775463330795674|Yes|0.0775463330795674|Yes"
  },{
    "CHROM": "chr1",
    "POS": 15765825,
    "ID": "NM_007272:g.15765825:G>A",
    "REF": "G",
    "ALT": "A",
    "QUAL": ".",
    "FILTER": ".",
    "INFO": "SPiP=A|NTR|00.04 % [00.02 % ; 00.08%]|+|substitution|G>A|Intron 1 (1795)|NM_007272|CTRC|donor|825|DeepIntron|0|Outside SPiCE Interpretation|0|No|NA|15765816|Acc|0.00206159394907144|No|Don|15765000|816|15765816|0.00161527498798199|No|15766795|0.0775463330795674|Yes|0.0775463330795674|Yes"
  }]

  // reorganize data into separate "files"
  progress.requiredLines.forEach(variant => {
    for (let [name,val] of Object.entries(variant.result))
    table_data["results"][name].push(val)
  })

  console.log(table_data)
  return table_data
  


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
  console.log("ss:",services)
	addCalculationProgress({"token":token,progress:getEmptyProgress(services)});
}

function getPermutationOfHeader(header){
  var original = ["#CHROM", "POS", "REF", "ALT"];
  var indices = original.map(function(x) {
    return header.indexOf(x);
  });
  return indices
}

function linesToVariants(lines, column_positions){
  console.log(lines)
  let indices = getPermutationOfHeader(column_positions)
  var to_calculate = []
  lines.forEach(line => {
    if (line[0] != '#') {
      var elements = line.split(/[\s\t,]+/)
      let g = new Genotype({chr:elements[indices[0]],pos:elements[indices[1]],ref:elements[indices[2]],alt:elements[indices[3]]})
      g.save();
      to_calculate = to_calculate.concat([g])
      console.log(g)
    }
  }
  )
  return to_calculate;
  
}

async function findLinesInDb(lines, column_positions) {
  var have_results = [];
  var no_results = [];

  let indices = getPermutationOfHeader(column_positions)

  var promises = lines.map(async function (line) {
    if (line[0] != '#') {
      var elements = line.split(/[\s\t,]+/);
      var values = [elements[indices[0]], elements[indices[1]], elements[indices[2]], elements[indices[3]]];

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

function setCalculationTarget(token, variants){
  console.log("Setting lines to", variants)
  let doc = CalculationProgress.findOneAndUpdate({"token":token}, 
        {$set:{requiredLines: variants}}, {new:true}).then(()=>{
          console.log("updated target")})
} 

async function saveResults(rows, column_positions){
  // rows - ['line1','line2','line3'] from vcf
  let variants = linesToVariants(rows,column_positions)
  console.log("Save results:",rows)
}

module.exports = {setCalculationTarget, linesToVariants, saveResults, findLinesInDb, setServiceStatus, isServiceBusy,initServices,getAnalysis, addAnalysis, addGenotype, addCalculationProgress,modifyCalculationProgress, getCalculationProgress, getGenotype}
