const mongoose = require('mongoose');

const server = '127.0.0.1:8080';
const database = 'adnotacje';

main().catch(err => console.log(err));

async function main() {
  console.log("Connecting to db...");
  try{
    await mongoose.connect(`mongodb://${server}/${database}`)
  }
  catch {
    console.log("Error while connecting")
  }
  console.log("connected to mongodb");
  require('./src/api.js');
  console.log("Started")
}
