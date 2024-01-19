const YAML = require('yaml')
const fs = require('fs')
const path = require('path')

const file = fs.readFileSync('config.yml', 'utf8')
var parsed = YAML.parse(file)

//create directory for files
if (!fs.existsSync(parsed.files.temp_dir)){
    fs.mkdirSync(parsed.files.temp_dir);
}

module.exports = parsed