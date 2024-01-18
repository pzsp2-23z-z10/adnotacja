const axios = require('axios')

async function requestCalculation(fstream, serviceAddress, port=5000){
	// fsteam - ReadStream of file to send
	// serviceAddress - address of something that will perform calculations
	// returns status, either "ok" or "error"

	
	let target = "http://"+serviceAddress+":"+port+'/api/calculateStuff'
	console.log("Request calculation:", target, fstream)
	return await axios.post(target, fstream).then((res)=>{
		console.log("got response",res.data)
		return res.data["status"];
	}).catch((error)=>{
		if (error.code=="ECONNREFUSED")
			console.log("Unable to connect to "+serviceAddress);
		return {"error":error.code}
	})
}

async function askForStatus(token, serviceAddress, port=5000){
	// fsteam - ReadStream of file to send
	// serviceAddress - address of something that will perform calculations
	let target = "http://"+serviceAddress+":"+port+'/api/status?token='+token
	console.log("making request to "+target)

	return await axios.get(target).then((res)=>{
		console.log("got response",res.data)
		return res.data;
	}).catch((error)=>{
		console.log("error")
		if (error.code=="ECONNREFUSED")
			console.log("Unable to connect to "+serviceAddress);
		return {"error":error.code}
	})
}

module.exports = {requestCalculation, askForStatus}