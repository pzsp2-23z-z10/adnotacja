const axios = require('axios')

async function requestCalculation(data){
	let url =  "http://localhost:5000" ///process.env.usersURL

	let target = url+'/api/calculateStuff'
	return await axios.post(target).then((res)=>{
		console.log("got response",res.data)
		return res.data;
	}).catch((error)=>{
		if (error.code=="ECONNREFUSED")
			console.log("Unable to connect to docker");
		return {"error":error.code}
	})
}

module.exports = {requestCalculation}