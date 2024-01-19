const fs = require('fs')
const path = require('path')
config = require('./config.js')

function cleanUp(token){
    //remove original file tied to this token
    fs.rmSync(config.files.temp_dir+token)
}

module.exports = {cleanUp}