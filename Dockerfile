FROM node:20 as builder


COPY ./ /src/node-red-contrib-processcube-amqp

WORKDIR /src/node-red-contrib-processcube-amqp

RUN npm install


FROM nodered/node-red:latest


COPY --from=builder /src/node-red-contrib-processcube-amqp /src/node-red-contrib-processcube-amqp

RUN npm install /src/node-red-contrib-processcube-amqp/
