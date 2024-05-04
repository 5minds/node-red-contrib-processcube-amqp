const amqplib = require('amqplib');

function showStatus(node, msgCounter) {
    if (msgCounter >= 1) {
        node.status({fill: "blue", shape: "dot", text: `handling tasks ${msgCounter}`});
    } else {
        node.status({fill: "blue", shape: "ring", text: `subcribed ${msgCounter}`});
    }
}

module.exports = function(RED) {
    function AMQPInput(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var flowContext = node.context().flow;

        const amqpServer = RED.nodes.getNode(config.amqpServer);

        async function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
  
        async function createConnection() {

            while (true) {
                try {
                    return await amqplib.connect(amqpServer.connectionString);
                } catch (e) {
                    await sleep(500);
                }
            }
        }

        async function initNode() {
            var connection = flowContext.get('amqpConnection');

            if (!connection) {
                connection = await createConnection();
                flowContext.set('amqpConnection', connection);
                connection.on("close", async () => {
                    flowContext.set('amqpConnection', undefined);
                    await initNode();
                });
            }
    
            const channel = await connection.createChannel();
            await channel.assertExchange(config.exchange, 'fanout');
            const queue = await channel.assertQueue(config.queue);
            await channel.bindQueue(queue.queue, config.exchange, '');
    
            await channel.consume(queue.queue, async (message) => {
                const msg = {
                    payload: JSON.parse(message.content.toString())
                };
    
                node.send(msg);
                channel.ack(message);
            });

            node.on("close", async () => {
                await channel.close();
            });
        }
        initNode();
    }
    RED.nodes.registerType("amqp-input", AMQPInput);
}