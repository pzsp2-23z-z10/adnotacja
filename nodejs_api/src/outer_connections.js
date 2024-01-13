const axios = require('axios')

async function requestCalculation(fstream, serviceAddress, port=5000){
	// fsteam - ReadStream of file to send
	// serviceAddress - address of something that will perform calculations

	let target = "http://"+serviceUrl+port+'/api/calculateStuff'
	return await axios.post(target, fstream).then((res)=>{
		console.log("got response",res.data)
		return res.data;
	}).catch((error)=>{
		if (error.code=="ECONNREFUSED")
			console.log("Unable to connect to "+serviceAddress);
		return {"error":error.code}
	})
}

module.exports = {requestCalculation}