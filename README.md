# Node-RED with RabbitMQ Integration

This repository contains a Docker Compose setup that integrates 
RabbitMQ with AMQP into Node-RED. The integration with a message 
bus like RabbitMQ provides the ability to interact with the ProcessCube 
platform (processcube.io) in a decoupled manner. While we use RabbitMQ 
as an example here, the setup can be adapted to work with any message 
bus that supports the AMQP protocol.

## Prerequisites

- Docker
- Docker Compose
- Node.js
- npm

## Setup

To set up and run the services, follow these steps:

1. Install the necessary dependencies with npm:

```bash
npm install
```

1. Build the Docker images:

```bash 
docker compose build
```

Start the services:
```bash
docker compose up
```

After the services (RabbitMQ and Node-RED) are running, you can access RabbitMQ 
via the management portal on `localhost` port `5672`. Use `guest` for both the 
username and password to log in.

## Node-RED

Node-RED is a programming tool for wiring together hardware devices, APIs and online 
services in new and interesting ways. In this setup, Node-RED is configured to use 
a custom node for RabbitMQ integration via AMQP.

You need to use the amqp-config node with a correct AMQP URL that can access a 
running RabbitMQ instance. See the rabbitmq service in the Docker Compose file 
for more details.

You can add an amqp-in node and subscribe to a sample exchange to receive messages 
and process them with a flow in Node-RED. Alternatively, you can publish an exchange 
with a routing key to send messages to other decoupled systems after processing in 
a Node-RED flow.

### RabbitMQ
RabbitMQ is an open-source message-broker software that originally implemented the 
Advanced Message Queuing Protocol (AMQP) and has since been extended with a plug-in 
architecture to support Streaming Text Oriented Messaging Protocol (STOMP), 
Message Queuing Telemetry Transport (MQTT), and other protocols.

In this setup, RabbitMQ is available for management at port `15672` and for 
AMQP connections at port `5672`.