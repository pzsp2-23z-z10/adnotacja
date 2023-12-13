let mongoose = require('mongoose');

let calculationProgressSchema = new mongoose.Schema({
    isAlgorithmFinished : [Boolean] 
});

const CalculationProgress = mongoose.model("CalculationProgress", calculationProgressSchema)
module.exports.CalculationProgress = CalculationProgress;
