import Connection from 'rabbitmq-client'

export default class RabbitMQProducer {

  private hostUrl: string;
  private queueName: string;

  constructor(hostUrl: string, queueName: string) {
    this.hostUrl = hostUrl;
    this.queueName = queueName;
  }

  public CreateConnection() {
    const rabbit = new Connection({
      url: this.hostUrl,
      retryLow: 1000,
      retryHigh: 30000
    });

    rabbit.on('connection', () => {
      console.log('Connection successfully established!');
    });

    rabbit.on('error', (err) => {
      console.log(err);
    });

    return rabbit;
  }

  public async ProduceMessage(connection: Connection, message: any) {
    const channel = await connection.acquire();

    channel.on('close', () => {
      console.log('Channel is closed.');
    });

    await channel.queueDeclare({queue: this.queueName});
    await channel.basicPublish({routingKey: this.queueName}, message);
    
    await channel.close();
    await connection.close();
  }

}
