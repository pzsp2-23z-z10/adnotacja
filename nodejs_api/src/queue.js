// handling of multple clients over multiple services
//
// when there is only one client, they are still in queue until calculations are done
// there is one queue for each service, services are pinged for status every now a then,
// when data is ready, client is popped from queue and results are saved to db

queues = {}

function createQueues(services){
    for (const [name, value] of Object.entries(services)){
        queues[name]=[]
    }

}

function isQueueEmpty(service_name){
    return queues[service_name].length==0
}

function peek(service_name){
    return queues[service_name][0]
}

function push(service_name, el){
    return queues[service_name].push(el)
}

function pop(service_name){
    return queues[service_name].shift(1)
}


module.exports = {createQueues, isQueueEmpty, peek, push, pop}