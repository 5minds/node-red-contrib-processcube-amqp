module.exports = function(RED) {
    function AMQPIntermediateOutput(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var flowContext = node.context().flow;

        const amqpServer = RED.nodes.getNode(config.amqpServer);

        node.on('input', async (msg) => {
            var connection = amqpServer.connection;

            if (!connection) {
                return;
            }

            const routingKey = (config.exchangeType == 'topic') ? RED.util.evaluateNodeProperty(config.routingKey, config.routingKeyFieldType, node) : '';
    
            const channel = await connection.createChannel();
            await channel.assertExchange(config.exchange, config.exchangeType);
    
            await channel.publish(config.exchange, routingKey, Buffer.from(JSON.stringify(msg.payload)));
            await channel.close();

            node.send(msg);
        });
        
    }
    RED.nodes.registerType("amqp-intermediate-output", AMQPIntermediateOutput);
}