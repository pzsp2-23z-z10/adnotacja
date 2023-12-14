const mongoose = require('mongoose');
const { Genotype } = require('./models/genotype.js');
const { CalculationProgress } = require('./models/calculation.js');

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

async function addCalculationProgress(progressForTokens) {
    let state = new CalculationProgress ({
        progress : progressForTokens
    });
    console.log("Saving new calculation progress", state);
    state.save();
}

async function modifyCalculationProgress(progressForTokens) {
    CalculationProgress.findOneAndUpdate({}, 
        {$set:{progress: progressForTokens}}, {new:true}
    )
    .then(updatedRecord => {
        console.log("Successfully updated record", updatedRecord);
    })
    .catch(err=>{
        console.error(err);
    })
}
module.exports = {addGenotype, addCalculationProgress,modifyCalculationProgress}