import Connection from 'rabbitmq-client'
import { Inject } from 'typedi/types/decorators/inject.decorator';
import { Service } from 'typedi/types/decorators/service.decorator';
import RabbitMQConnectionContainer from '../../config/rabbitmq_instance';
import EventInfo from '../../entities/models/event_info';

@Service()
export default class RabbitMQService {

  private hostUrl: string;
  private events: EventInfo[] = [];
  private rabbitMqHost: RabbitMQConnectionContainer

  /*constructor(hostUrl: string) {
    this.hostUrl = hostUrl;
  }*/

  constructor(@Inject() rabbitMqHost: RabbitMQConnectionContainer) {
    this.rabbitMqHost = rabbitMqHost;
  }

  public getEvents() {
    return this.events;
  }

  public CreateConnection() {
    const rabbit = new Connection({
      url: this.rabbitMqHost.GetRabbitConnection(),
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
    const consumer = connection.createConsumer({
      queue: 'fetch-organizer-events-response-queue',
      qos: {prefetchCount: 2},
      exchanges: [{exchange: 'organizer-events-exchange', type: 'topic', autoDelete: true, durable: true}],
      queueBindings: [
        {exchange: 'organizer-events-exchange', routingKey: 'events.result'}
      ]
    },
    async (message) => {
      this.events = message.body as EventInfo[];
    });

    consumer.on('error', (err) => {
      console.error(err);
    });

    return this.events;
  }
}
