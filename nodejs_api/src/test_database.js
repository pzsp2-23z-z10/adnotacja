let mongoose = require('mongoose');
const { addGenotype, addCalculationProgress, modifyCalculationProgress, getCalculationProgress } = require("./database_operations");
const server = '127.0.0.1:27017';
const database = 'adnotacje';

mongoose.connect(`mongodb://${server}/${database}`)


async function test_progress_updating()
{
	addCalculationProgress({"token":"tokentest", "progress":[false, false, false]})
	modifyCalculationProgress("tokentest", [true,true,true])
	let progress = await getCalculationProgress("tokentest")
	console.log("progress:", progress.progress)
}

async function test_add_genotype()
{
	addGenotype("chr10", 1.04e+08, "A", "C", [{"atrybut1": 10}, {"atrybut2": 20}]);
}