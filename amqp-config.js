module.exports = function(RED) {
    function AMQPServerNode(n) {
        RED.nodes.createNode(this,n);
        this.connectionString = n.connectionString;
    }
    RED.nodes.registerType("amqp-config",AMQPServerNode);
}