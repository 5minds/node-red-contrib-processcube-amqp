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

        const amqpServer = RED.nodes.getNode(config.amqpServer);

        async function initNode() {
            var connection = amqpServer.connection;

            if (!connection) {
                return;
            }

            const routingKey = (config.exchangeType == 'topic') ? RED.util.evaluateNodeProperty(config.routingKey, config.routingKeyFieldType, node) : '';
    
            const channel = await connection.createChannel();
            await channel.assertExchange(config.exchange, config.exchangeType);
            const queue = await channel.assertQueue(config.queue);
            await channel.bindQueue(queue.queue, config.exchange, routingKey);
    
            await channel.consume(queue.queue, async (message) => {


                const msg = {};
    
                try {
                    msg.payload = JSON.parse(message.content.toString());
                } catch (e) {
                    msg.payload = message.content.toString();
                }

                node.send(msg);
                channel.ack(message);
            });

            const onCloseHandlerId = connection.onClose(async () => {
                console.log('onClose connection');
                await initNode();
            });

            node.on("close", async () => {
                console.log('closeChannel');
                try {
                    await channel.close();
                    connection.removeOnCloseHandler(onCloseHandlerId);
                } catch {
                    console.warn('Channel closed');
                }
            });
        }
        initNode();
    }
    RED.nodes.registerType("amqp-input", AMQPInput);
}