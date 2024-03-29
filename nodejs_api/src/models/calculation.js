let mongoose = require('mongoose');
const { Genotype } = require('./genotype');

let calculationProgressSchema = new mongoose.Schema({
    token : {
        type: String,
        required: true
    },
    progress : {
        type: mongoose.Schema.Types.Mixed
    },
    requiredLines : [{ type: mongoose.ObjectId, ref: Genotype }]
});


function getEmptyProgress(services){
    let progress = {}
    for (let service of services.services){
        progress[service]=false
    }
    return progress
}

// for each known service it's status is registered
// active field either holds token of whoever started the calculations,
// or nothing, then somebody else is free to use this service
let serviceStatusSchema = new mongoose.Schema({
    service_id : {
        type: String,
    },
    active_token : {
        type: String,
        //required: true
    } 
});

const CalculationProgress = mongoose.model("CalculationProgress", calculationProgressSchema)
const ServiceStatus = mongoose.model("ServiceStatus", serviceStatusSchema)
module.exports = {getEmptyProgress,CalculationProgress,ServiceStatus};
