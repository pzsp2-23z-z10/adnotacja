const express = require('express')
const db = require('./database_operations.js')
const router = express.Router()

app = express()
app.use(express.json());

app.use('/analysis', router)

router.post('/new', async (req, res, next) => {
/*
  #swagger.description = 'Create new analysis request'
  #swagger.requestBody = {
    required: true,
    content:
      application/json:
        schema:
          format: {...}
  }*/
  let result
  try {
    result = await db.addAnalysis(req.body); //still await for errors
  }
  catch (err){
    return next("Invalid request")
  }
  return res.status(200).send({"token":result});
});

router.get('/status/', async (req, res, next) => {
  return res.status(500).send({"status":"missing analysis identifier"});

});

router.get('/status/:token', async (req, res, next) => {
  // #swagger.description = 'Get analysis status'
  let token = req.params.token; //  #swagger.parameters['token'] = { description: 'analysis identifier, returned from `/new` endpoint', type:'string' }

  let result = await db.getAnalysis(token);
  if (result.error)
    return res.status(500).send();
  return res.status(200).send(result);

});


app.listen(process.env.PORT, () =>
  console.log(`API listening on port ${process.env.PORT}!`),
);