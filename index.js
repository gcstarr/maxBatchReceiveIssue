let ServiceBusClient = require('./serviceBusClient');

let client = new ServiceBusClient("CONNECTION STRING HERE");

let counter = 0;

let onMessage = async (messages) => {
    counter++;
    console.log("Batch " + counter + " received. Size: " + messages.length);
    let promises = [];
    for (let i = 0; i < messages.length; i++) {
        promises.push(messages[i].complete());
    }

    await Promise.all(promises);

    console.log("Batch " + counter + " accepted.");
};

let onError = async (err) => {
    console.error(err);
};

client.batchSubscribe("QUEUE NAME HERE", 100, 10, onMessage, onError);
