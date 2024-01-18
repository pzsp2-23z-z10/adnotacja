const express = require('express')
const fs = require('fs')
const fileUpload = require('express-fileupload');
const router = express.Router()
const bodyParser = require("body-parser")

const db = require('./database_operations.js');
const vcf = require('./vcf.js')
const outer_connections = require('./outer_connections.js')
const queue = require('./queue.js')
config = require('./config.js')
db.initServices(config)


app = express()
app.use(express.json({limit: '10mb'}));
app.use(bodyParser.json({limit: '10mb'}));
app.use(fileUpload());

app.use('/analysis', router)

const uploadDir = "/tmp/"

router.post('/new', async (req, res, next) => {
/*
  #swagger.description = 'Create new analysis request'
  #swagger.requestBody = {
    required: true,
    content:
      application/octet-stream:
        name: "file"
  }*/
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  if (req.files.file===undefined){
    req.files.file=req.files[Object.keys(req.files)[0]] //don't care about the param name
  }

  // console.log(req.body.alg);  lista wybranych algorytmów np: [ 'pangolin5', 'SPiP' ]

  var token = Math.floor(new Date().getTime() / 1000)
  tmpFile = uploadDir + token
  req.files.file.mv(tmpFile, async function(err){
      if (err) return res.status(500).send(err);
      try {
        console.log("Starting analysis:",token)
        
        //@TODO: save the file data somewhere in database

        var options = {}
        let selected_algs = req.body.alg
        if (typeof(selected_algs)=="string"){
          queue.push(selected_algs,token)
          options = {"services":[selected_algs]}
        }
        else if (Array.isArray(selected_algs)){
          selected_algs.forEach(service => queue.push(service,token))
          options = {"services":selected_algs}
        }
        else{
          console.error("unknown request params:",selected_algs)
          return res.status(400).send()
        }
        db.addAnalysis(token,options)
        //@TODO: fast forward to next check? otherwise some time is lost
      }
      catch (err){
        console.error("mv error: ",err)
        return next("Invalid request")
      }
      console.log("New token:"+token)
      return res.status(200).send({"token":token});
  })
});

router.get('/status/', async (req, res, next) => {
  return res.status(500).send({"status":"missing analysis identifier"});

});

router.get('/status/:token', async (req, res, next) => {
  // #swagger.description = 'Get analysis status'
  let token = req.params.token; //  #swagger.parameters['token'] = { description: 'analysis identifier, returned from `/new` endpoint', type:'string' }

  let result = await db.getAnalysis(token);
  if (result.error){
    if (result.error=="Unknown token")
      return res.status(404).send();
    else
      return res.status(500).send();
  }
  else if (result.status=="Not_ready")
    return res.status(202).send(result);
  else
    return res.status(200).send(result);

});

router.get('/algorithms', async (req, res, next) => {
  const service_names = Object.keys(config);
  return res.status(200).send(service_names);
});

async function checkQueues(){
  console.debug("Periodic queue check")
  for (const [name, value] of Object.entries(config)){
    if (!queue.isQueueEmpty(name)){
      if (await db.isServiceBusy(name)){
        console.log("Service",name," busy, check docker response...")
        // ping service to check status
        let status = await outer_connections.askForStatus(queue.peek(name), value['address'], value['port'])
        if (status['done']==true){
          console.log("done")
          let token = queue.pop(name); //remove from queue
          let progress = db.getCalculationProgress(token)
          progress[name]=true
          db.modifyCalculationProgress(token,progress)
          console.log("Parsing result...")
          let [header, lines] = vcf.parseArray(status['result'])
          db.saveResults(lines,header)
          db.setServiceStatus(name,"free")
        }
      }
      else{
        // service not busy and something is in queue, begin calculation
        let token = queue.peek(name)
        let stream = fs.createReadStream(uploadDir+token)
        let [header,lines] = await vcf.parseFile(stream); //column order and relevant lines, as text

        var results = await db.findLinesInDb(lines, header)
        console.log("Have results: ")
        console.log(results.have_results)

        results.no_results.unshift(header.join("\t"));
        let result = await outer_connections.requestCalculation(results.no_results, value['address'], value['port'])
        if (result=="ok"){
          // only when calculation start is confirmed, make service busy and remember what lines user wants 
          db.setServiceStatus(name,queue.peek(name));
          let variants = db.linesToVariants(lines, header)
          db.setCalculationTarget(token,variants) // what the user wants
        }
        else{
          console.error("Something went wrong:",result)
        }
      }
    }
}
}


app.listen(process.env.PORT??=1234, () => {
  console.log(`API listening on port ${process.env.PORT}!`)

  queue.createQueues(config);
  setInterval(checkQueues,10000);
  //queue.push(Object.keys(config)[0],"token123")

});