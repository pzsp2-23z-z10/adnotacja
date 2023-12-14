const mongoose = require('mongoose');
const outer_connections = require('./outer_connections.js')

async function getAnalysis(id){

	console.log("Somebody asked for analysis id:",id)
	return {
  "id": 123,
  "Wyniki": [
    {
      "name": "SPiP",
      "result": [
        {
          "CHROM": "chr1",
          "POS": 15765825,
          "ID": "NM_007272:g.15765825:G>A",
          "REF": "G",
          "ALT": "A",
          "QUAL": ".",
          "FILTER": ".",
          "INFO": "SPiP=A|NTR|00.04 % [00.02 % ; 00.08%]|+|substitution|G>A|Intron 1 (1795)|NM_007272|CTRC|donor|825|DeepIntron|0|Outside SPiCE Interpretation|0|No|NA|15765816|Acc|0.00206159394907144|No|Don|15765000|816|15765816|0.00161527498798199|No|15766795|0.0775463330795674|Yes|0.0775463330795674|Yes"
        }
      ]
    }
  ]
}
}

async function addAnalysis(data){

	//@TODO check if valid
	console.log("Starting analysis:",data.path)

	// here will be some concurrent action, request is scheduled and token is returned
	outer_connections.requestCalculation(data)
	return Math.floor(new Date().getTime() / 1000)
}

module.exports = {getAnalysis, addAnalysis}