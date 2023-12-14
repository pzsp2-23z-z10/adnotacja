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
module.exports = {addGenotype, addCalculationProgress,modifyCalculationProgress, getCalculationProgress}