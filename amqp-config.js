const AMQPConnection = require('./amqp-connection');

module.exports = function(RED) {
    function AMQPServerNode(n) {
        RED.nodes.createNode(this,n);
        this.connectionString = n.connectionString;
        const node = this;

        this.connection = new AMQPConnection(this.connectionString);
        this.connection.connect();
    }
    RED.nodes.registerType("amqp-config",AMQPServerNode);
}