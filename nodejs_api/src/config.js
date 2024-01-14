const YAML = require('yaml')
const fs = require('fs')


const file = fs.readFileSync('../common/config.yml', 'utf8')
var parsed = YAML.parse(file).services

module.exports = parsed