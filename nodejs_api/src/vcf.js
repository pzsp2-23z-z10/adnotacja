async function parseFile(data){
    //returns column names and lines following that order

	//@TODO check if valid
	console.log("Make analysis",data.path);
  try {
  var lines = await parseStreamByLines(data);
  } catch (error) {
    console.error("Error:", error);
  }
  var header = ""
  for(let line of lines){
    if (line.slice(0,2) != '##') {
      header = line;
      break;
    }
  };
  var column_names = header.split(/[\s,\t]+/)
  var column_positions = [column_names.indexOf('CHROM'), column_names.indexOf('POS'), column_names.indexOf('REF'), column_names.indexOf('ALT')]
  return [column_names,lines]
}

function parseStreamByLines(data) {
    return new Promise((resolve, reject) => {
    var stream = require('stream'); 
    var xtream = new stream.Transform( { objectMode: true } );
  
    xtream._transform = function(chunk, encoding, done) {
      var strData = chunk.toString();
  
      if (this._invalidLine) {
        strData = this._invalidLine + strData;
      };
  
      var objLines = strData.split("\n"); 
      this._invalidLine = objLines.splice(objLines.length-1, 1)[0];  
      this.push(objLines);
  
      done();
    };
  
    xtream._flush = function(done) {
      if (this._invalidLine) {   
        this.push([this._invalidLine]); 
      };
  
      this._invalidLine = null;
      done();
    };
    
    var all_lines = [];
    data.pipe(xtream);
    xtream.on('readable', function(){ 
      while (lines = xtream.read()) { 
        lines.forEach(function(line, index){
          all_lines.push(line);
        });   
      }
      xtream.on('end', function () {
        resolve(all_lines);
      });
  
      xtream.on('error', function (err) {
        reject(err);
      });
    });
    });
  }

module.exports = {parseFile}