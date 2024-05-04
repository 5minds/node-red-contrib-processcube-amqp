const amqplib = require('amqplib');

module.exports = function(RED) {
    function AMQPOutput(config) {
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

        node.on('input', async (msg) => {
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
    
            await channel.publish(config.exchange, '', Buffer.from(JSON.stringify(msg.payload)));
            await channel.close();
        });
        
    }
    RED.nodes.registerType("amqp-output", AMQPOutput);
}