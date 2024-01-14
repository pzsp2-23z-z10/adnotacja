let mongoose = require('mongoose');
const { addGenotype, addCalculationProgress, modifyCalculationProgress, getCalculationProgres, getGenotype } = require("./database_operations");
const { Genotype } = require('./models/genotype');
const server = '127.0.0.1:27017';
const database = 'adnotacje';
const { ObjectId } = require('mongodb');
mongoose.connect(`mongodb://${server}/${database}`)


async function test_progress_updating()
{
	addCalculationProgress({"token":"tokentest", "progress":[false, false, false]})
	modifyCalculationProgress("tokentest", [true,true,true])
	let progress = await getCalculationProgress("tokentest")
	console.log("progress:", progress.progress)
}
//chr17	41276133	.	C	A
async function test_add_genotype()
{
	addGenotype("chr17", 41276133, "C", "A", [{name: "algorytm_3", value: 0}, {name: "algorytm_2", value: 5}]);
}

async function test_find()
{
	res = await getGenotype("chr17", 41276135, "T", "G")
	nestedObject = res[2]
	nestedObject.result.forEach((nestedItem, index) => {
		console.log(nestedItem.name, " ", nestedItem.value)
	});
}

test_add_genotype()
// console.log("Added successfully")
// test_find()
