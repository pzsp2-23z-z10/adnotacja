const mongoose = require('mongoose');

require('./src/api.js');

main().catch(err => console.log(err));

async function main() {
  //console.log("Connecting to db...");
  //await mongoose.connect('mongodb://127.0.0.1:27017/test');
  //console.log("connected to mongodb");
  console.log("Started")
}
