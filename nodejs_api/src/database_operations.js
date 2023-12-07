const mongoose = require('mongoose');

async function getAnalysis(id){

	console.log("Somebody asked for analysis id:",id)
	return {"status":"Done","id":id,"data":{"A":"cośtam","B":"cośtam2"}}
}

async function addAnalysis(q){

	//@TODO check if valid
	console.log("Starting analysis:",q)
	return Math.floor(new Date().getTime() / 1000)
}

module.exports = {getAnalysis, addAnalysis}