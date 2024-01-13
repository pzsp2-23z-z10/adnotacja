const express = require('express')
const fs = require('fs')
const fileUpload = require('express-fileupload');
const router = express.Router()
const bodyParser = require("body-parser")

const db = require('./database_operations.js');
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

  tmpFile = uploadDir + req.files.file.name
  req.files.file.mv(tmpFile, async function(err){
      if (err) return res.status(500).send(err);
      let stream = fs.createReadStream(tmpFile)
      let result
      try {
        console.log("Starting analysis:",data.path)
        const token = Math.floor(new Date().getTime() / 1000)

        let result = outer_connections.requestCalculation(data)
        result = await db.addAnalysis(stream); //still await for errors
      }
      catch (err){
        return next("Invalid request")
      }
      console.log(result)
      return res.status(200).send({"token":result});
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

async function checkQueues(){
  for (const [name, value] of Object.entries(config)){
    console.debug("Periodic queue check")
    if (!queue.isQueueEmpty(name)){
      let status = await outer_connections.askForStatus(value['address'],queue.peek(name))
      if (status['done']==true){
        console.log("done")
        let token = queue.pop(name); //remove from queue
        let progress = db.getCalculationProgress(token)
        progress[name]=true
        db.modifyCalculationProgress(token,progress)
      }
    }
}
}


app.listen(process.env.PORT??=1234, () => {
  console.log(`API listening on port ${process.env.PORT}!`)

  queue.createQueues(config);
  setInterval(checkQueues,5000);
  queue.push(Object.keys(config)[0],"token123")

});