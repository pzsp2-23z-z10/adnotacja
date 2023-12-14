let mongoose = require('mongoose');

let genotypeSchema = new mongoose.Schema({
    chr : {
        type: String,
        required: true
    },
    pos : {
        type: Number,
        required: true
    },
    ref : {
        type: String,
        required: true
    },
    alt : {
        type: String,
        required: true
    },
    result : [{
        name: String,
        value: Number
    }]
});

const Genotype = mongoose.model("Genotype", genotypeSchema);
module.exports.Genotype = Genotype;