import { Service } from "typedi";

@Service()
export default class RabbitMQConnectionContainer {
    private rabbitMqConnection: string = String(process.env.RABBITMQ_URL)

    public GetRabbitConnection() {
        return this.rabbitMqConnection;
    }
}