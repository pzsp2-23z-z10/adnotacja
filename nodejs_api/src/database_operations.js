const mongoose = require('mongoose');
const outer_connections = require('./outer_connections.js')

const { Genotype } = require('./models/genotype.js');
const { CalculationProgress } = require('./models/calculation.js');

async function getAnalysis(id){
	
	console.log("Somebody asked for analysis id:",id)
	let progress = await getCalculationProgress(id);
	console.log(progress)
	if (progress===null)
	{
		console.log("this token is not in database.")
		return {error:"Unknown token"}
	}
	else if (progress.progress[0]==false)
	{
		console.log("Analysis is not finished.")
		return {status:"Not_ready"}
	}
	return {"status":"Done","id":id,"data":{"A":"cośtam","B":"cośtam2"}}
}

async function addAnalysis(data){

	//@TODO check if valid
	console.log("Starting analysis:",data)

	// here will be some concurrent action, request is scheduled and token is returned
	outer_connections.requestCalculation(data)
	const token = Math.floor(new Date().getTime() / 1000)
	addCalculationProgress({"token":token,progress:[false]});
	setTimeout(()=> {
		//symulacja tego, że dane są gotowe
		modifyCalculationProgress(token,[true]);
		console.log("!!! Analysis done for token",token)
	}, 10000);
	return token;
}

async function addGenotype(chr, pos, ref, alt, result) {
    let gen = new Genotype({
        chr : chr,
        pos : pos, 
        ref : ref,
        alt : alt, 
        result : result       
    });
    console.log("Saving new genotype:", gen);
    gen.save();
}

async function addCalculationProgress(progress) {
    let state = new CalculationProgress (progress);
    console.log("Saving new calculation progress", state);
    state.save();
}

async function getCalculationProgress(token) {
    return CalculationProgress.findOne({"token":token})
}

async function modifyCalculationProgress(token, newProgress) {
    CalculationProgress.findOneAndUpdate({"token":token}, 
        {$set:{progress: newProgress}}, {new:true}
    )
    .then(updatedRecord => {
        console.log("Successfully updated record", updatedRecord);
    })
    .catch(err=>{
        console.error(err);
    })
}


module.exports = {getAnalysis, addAnalysis, addGenotype, addCalculationProgress,modifyCalculationProgress, getCalculationProgress}