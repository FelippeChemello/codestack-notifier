import { Channel, connect, Connection, ConsumeMessage } from 'amqplib'

export default class RabbitService {
    private uri: string
    private conn: Connection
    private channel: Channel

    constructor() {
        if (!process.env.RABBITMQ_USER || !process.env.RABBITMQ_PASSWORD || !process.env.RABBITMQ_HOST || !process.env.RABBITMQ_PORT) {
            console.error('Error at loading RabbitMQ auth')
            process.exit(1)
        }

        this.uri = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
    }

    async start(queue: string): Promise<void> {
        this.conn = await connect(this.uri)
        this.channel = await this.conn.createChannel()

        this.channel.assertQueue(queue)
    }

    async consume(queue: string, callback: (message: ConsumeMessage) => void) {
        return this.channel.consume(queue, message => {
            if (!message) {
                console.error('Failed to get message')
                return
            }

            callback(message)
            this.channel.ack(message)
        })
    }
}
