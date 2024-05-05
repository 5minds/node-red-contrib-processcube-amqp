const amqplib = require('amqplib');
const AMQPConnection = require('./amqp-connection');

module.exports = function(RED) {
    function AMQPOutput(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var flowContext = node.context().flow;

        const amqpServer = RED.nodes.getNode(config.amqpServer);

        node.on('input', async (msg) => {
            var connection = flowContext.get('amqpConnection');

            if (!connection) {
                connection = new AMQPConnection(amqpServer.connectionString);
                flowContext.set('amqpConnection', connection);
            }
    
            const channel = await connection.createChannel();
            await channel.assertExchange(config.exchange, config.exchangeType);
    
            await channel.publish(config.exchange, config.routingKey, Buffer.from(JSON.stringify(msg.payload)));
            await channel.close();
        });
        
    }
    RED.nodes.registerType("amqp-output", AMQPOutput);
}