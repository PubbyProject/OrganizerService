import Connection from 'rabbitmq-client'
import EventInfo from '../../entities/models/event_info';

export default class RabbitMQProducer {

  private hostUrl: string;
  private events: EventInfo[] = [];

  constructor(hostUrl: string) {
    this.hostUrl = hostUrl;
  }

  public getEvents() {
    return this.events;
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
    const producer = connection.createPublisher({
      confirm: true,
      maxAttempts: 3,
      exchanges: [{exchange: 'organizer-events-exchange', type: 'topic', autoDelete: true, durable: true}],
    });

    await producer.publish({
      exchange: 'organizer-events-exchange', type: 'topic', routingKey: 'events.fetch'
    }, message);

    await producer.close();

    const events = await this.ConsumeMessage(connection);
    return events;
  }

  public async ConsumeMessage(connection: Connection) {
    let events: EventInfo[] = [];
    const consumer = connection.createConsumer({
      queue: 'fetch-organizer-events-response-queue',
      qos: {prefetchCount: 2},
      exchanges: [{exchange: 'organizer-events-exchange', type: 'topic', autoDelete: true, durable: true}],
      queueBindings: [
        {exchange: 'organizer-events-exchange', routingKey: 'events.result'}
      ]
    },
    async (message) => {
      events = message.body as EventInfo[];
    });

    consumer.on('error', (err) => {
      console.error(err);
    });

    return events;
  }
}
