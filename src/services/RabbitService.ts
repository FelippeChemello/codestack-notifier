import { Channel, connect, Connection, ConsumeMessage } from 'amqplib'

export default class RabbitService {
    private uri: string
    private conn: Connection
    private channel: Channel

    constructor() {
        if (!process.env.RABBITMQ_URI) {
            console.error('Error at loading RabbitMQ URI')
            process.exit(1)
        }

        this.uri = process.env.RABBITMQ_URI
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
