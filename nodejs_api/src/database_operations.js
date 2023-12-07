const mongoose = require('mongoose');
const outer_connections = require('./outer_connections.js')

async function getAnalysis(id){

	console.log("Somebody asked for analysis id:",id)
	return {"status":"Done","id":id,"data":{"A":"cośtam","B":"cośtam2"}}
}

async function addAnalysis(data){

	//@TODO check if valid
	console.log("Starting analysis:",data)

	// here will be some concurrent action, request is scheduled and token is returned
	outer_connections.requestCalculation(data)
	return Math.floor(new Date().getTime() / 1000)
}

module.exports = {getAnalysis, addAnalysis}