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

async function isAnalysisDone(id){
  // lighter version of getAnalysis, without populating the results
  let progress = await getCalculationProgress(id, populate=false);
	if (progress===null)
	{
		console.log("this token is not in database.")
		return {error:"Unknown token"}
	}
	else if (Object.values(progress.progress).includes(false))
	{
		return false
	}
  console.log("analysis done:",progress.progress)
  return true
}

async function getAnalysis(id){
	
	console.log("Somebody asked for analysis id:",id)
	let progress = await getCalculationProgress(id, populate=true);
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

  table_data = {"id":id,"results":{}}

  for ( service of Object.keys(progress.progress)){
    table_data["results"][service]=[]
  }


  for (vcf_line of progress.requiredLines){
    for ( service of Object.keys(progress.progress)){
      data = {"#CHROM": vcf_line.chr,
              "POS":    vcf_line.pos,
              "ID":     ".",
              "REF":    vcf_line.ref,
              "ALT":    vcf_line.alt,
              "QUAL":   ".",
              "FILTER": ".",
              "INFO":   vcf_line.result[service]}
      table_data["results"][service].push(data)
    }
  }

  return table_data
}
  
async function addAnalysis(token, services){
	addCalculationProgress({"token":token,progress:getEmptyProgress(services)});
}

function getPermutationOfHeader(header){
  var original = ["#CHROM", "POS", "ID", "REF", "ALT", "QUAL", "FILTER", "INFO"];
  var indices = original.map(function(x) {
    return header.indexOf(x);
  });
  return indices
}

async function linesToVariants(lines, column_positions, service_name=null){
  // turns vcf lines into variant objects. Existing ones in database are being found and returned
  let indices = getPermutationOfHeader(column_positions)
  var to_calculate = []
  await Promise.all(lines.map(async line => {
    if (line[0] != '#') {
      var elements = line.split(/\t+/)
      let filter = {chr:elements[indices[0]],pos:elements[indices[1]],ref:elements[indices[3]],alt:elements[indices[4]]}
      let g = await Genotype.findOne(filter)
      if (!g){
        g = new Genotype(filter)
      }
      if (service_name){
        let important = {}; important[service_name]=elements[indices[7]]
        // data is being saved, name is the service name that just gave data, write that to db
        if (g.result==undefined || (typeof(g.result=="object") && Object.keys(g.result).length==0)){
          g.result=important
        }
        else if (g.result[service_name]!=undefined){
            //console.error("trying to overwrite existing data")
        }
        else{
          g.result[service_name]=elements[indices[7]]
        }
      }
      g.markModified('result');
      g.save()
      to_calculate = to_calculate.concat([g])
    }
  }))
  console.log("returning",to_calculate.length,"to calculate")
  return to_calculate;
}

async function findLinesInDb(lines, column_positions, name=null) {
  // if name is set, results must contain this service's results, otherwise it doesn't count
  var have_results = [];
  var no_results = [];

  let indices = getPermutationOfHeader(column_positions)

  var promises = lines.map(async function (line) {
    if (line[0] != '#') {
      var elements = line.split(/\t+/);
      var values = [elements[indices[0]], elements[indices[1]], elements[indices[3]], elements[indices[4]]];

      var genotype = await getGenotype(values[0], values[1], values[2], values[3]);

      if (genotype && genotype.result && genotype.result[name]) {
        //console.log("Found in db: " + line);
        var all_results = '';
        for (service in genotype.result){
          all_results += name + " (length)" + genotype.result[name].length + " "
        }
        have_results.push(line+all_results)
      }
      else{
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
  return Genotype.findOne({$and:[{"chr":chr}, {"pos":pos}, {"ref":ref}, {"alt":alt}]})
}
async function addCalculationProgress(progress) {
    let state = new CalculationProgress (progress);
    console.log("Saving new calculation progress", state);
    state.save();
}

async function getCalculationProgress(token, populate=false) {
  if (!populate)
    return CalculationProgress.findOne({"token":token})
  else
  return CalculationProgress.findOne({"token":token}).populate("requiredLines")
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
          console.log("Successfully updated calculation status for", token);

        }
    })
    .catch(err=>{
        console.error(err);
    })
}

function setCalculationTarget(token, variants){
  variants=variants.map(v=> v._id)
  let doc = CalculationProgress.findOneAndUpdate({"token":token}, 
        {$set:{requiredLines: variants}}, {new:true}).then(()=>{
          console.log("updated target")})
} 

async function saveResults(service_name, rows, column_positions){
  // rows - ['line1','line2','line3'] from vcf
  let variants = await linesToVariants(rows,column_positions, service_name)

  console.log("Save results from",service_name,":",variants.length)
}

module.exports = {isAnalysisDone, setCalculationTarget, linesToVariants, saveResults, findLinesInDb, setServiceStatus, isServiceBusy,initServices,getAnalysis, addAnalysis, addGenotype, addCalculationProgress,modifyCalculationProgress, getCalculationProgress, getGenotype}

