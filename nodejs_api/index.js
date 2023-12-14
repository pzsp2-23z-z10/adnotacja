const mongoose = require('mongoose');

require('./src/api.js');

const server = '127.0.0.1:27017';
const database = 'adnotacje';

main().catch(err => console.log(err));

async function main() {
  console.log("Connecting to db...");
  await mongoose.connect(`mongodb://${server}/${database}`)
  console.log("connected to mongodb");
  console.log("Started")
}
