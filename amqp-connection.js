const amqplib = require('amqplib');
const { v4: uuidv4 } = require('uuid');

module.exports = function(connectionString) {
    this.connectionString = connectionString;
    this.onCloseHandler = {};

    this.connect = async function() {
        console.log('connect!!!');

        this.connection = await createConnection(this.connectionString);
        this.connection.on("close", async () => {
            this.connection = undefined;

            const onCloseHandler = this.onCloseHandler;
            this.onCloseHandler = {};

            const promises = [];


            for (const [key, handler] of Object.entries(onCloseHandler)) {
                promises.push(handler());
            }

            await this.connect();
            await Promise.all(promises);
        });
    }

    this.createChannel = async function() {
        while (!this.connection) {
            await sleep(100);
        }

        return await this.connection.createChannel();
    }

    this.onClose = function (handler) {
        const handlerId = uuidv4();
        this.onCloseHandler[handlerId] = handler;

        return handlerId;
    }

    this.removeOnCloseHandler = function(handlerId)  {
        delete this.onCloseHandler[handlerId];
    }

    async function createConnection(connectionString) {

        while (true) {
            try {
                return await amqplib.connect(connectionString);
            } catch (e) {
                console.log(e);
                await sleep(500);
            }
        }
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}