let mongoose = require('mongoose');

let calculationProgressSchema = new mongoose.Schema({
    progress : {
        type: mongoose.Schema.Types.Mixed
    } 
});

const CalculationProgress = mongoose.model("CalculationProgress", calculationProgressSchema)
module.exports.CalculationProgress = CalculationProgress;
