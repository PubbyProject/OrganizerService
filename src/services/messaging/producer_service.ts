import amqp, { Connection } from 'amqplib/callback_api'

const createMQProducer = (amqpUrl: string, queueName: string) => {
  console.log('Connecting to RabbitMQ...')
  let ch: amqp.Channel;
  amqp.connect(amqpUrl, (errorConnect: Error, connection: Connection) => {
    if (errorConnect) {
      console.log('Error connecting to RabbitMQ: ', errorConnect)
      return
    }

    connection.createChannel((errorChannel, channel) => {
      if (errorChannel) {
        console.log('Error creating channel: ', errorChannel)
        return
      }

      ch = channel
      console.log('Connected to RabbitMQ')
    })
  })

  return (msg: string) => {
    console.log('Produce message to RabbitMQ...')
    console.log(`Queue: ${queueName}`)
    console.log(`Msg variable in producer: ${msg}`)
    return ch.sendToQueue(queueName, Buffer.from(msg))
  }
}

export default createMQProducer;