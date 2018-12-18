const serviceBus = require('@azure/service-bus');

class ServiceBusClient {

    constructor(connectionString) {
        this.namespace = serviceBus.Namespace.createFromConnectionString(connectionString);

        this.receivers = new Set();
    }

    async _batchLoop(entityPath, desiredBatchSize, maxBatchWait, onMessages) {
        if (this.receivers.has(entityPath)) {
            throw new Error("Cannot have concurrent subscriptions to the same entity path.");
        }

        this.receivers.add(entityPath);

        const client = this.namespace.createQueueClient(entityPath, { receiveMode: serviceBus.ReceiveMode.peekLock });
        while (this.receivers.has(entityPath)) {
            const messages = await client.receiveBatch(desiredBatchSize, maxBatchWait);
            await onMessages(messages);
        }
    }

    batchSubscribe(entityPath, desiredBatchSize, maxBatchWait, onMessages, onError) {
        this._batchLoop(entityPath, desiredBatchSize, maxBatchWait, onMessages)
            .catch(err => {
                return onError(err);
            });
    };

    UnsubscribeAfterCurrentBatch(entityPath) {
        if (!this.receivers.has(entityPath)) {
            throw new Error("Cannot unsubscribe from a path that is not subscribed-to.");
        }

        this.receivers.delete(entityPath);
    }
}

module.exports = ServiceBusClient;   