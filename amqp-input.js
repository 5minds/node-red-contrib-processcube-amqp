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
  
        async function initNode() {
            var connection = flowContext.get('amqpConnection');

            if (!connection) {
                connection = await amqplib.connect(amqpServer.connectionString);
                flowContext.set('amqpConnection', connection);
            }
    
            const channel = await connection.createChannel();
            await channel.assertExchange('Test', 'fanout');
            const queue = await channel.assertQueue('TestQueue');
            await channel.bindQueue(queue.queue, 'Test', '');
    
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