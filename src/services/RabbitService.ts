import { Channel, connect, Connection, ConsumeMessage } from 'amqplib'

import sleep from '../utils/sleep'

import EmailService from './EmailService'

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

    async start(queue: string, tries = 0): Promise<void> {
        try {
            this.conn = await connect(this.uri)
            this.channel = await this.conn.createChannel()

            this.channel.assertQueue(queue)
        } catch (e) {
            if (tries >= 10) {
                const emailService = new EmailService()
                await emailService.sendMail({
                    app: 'Notifier',
                    destination: ['email'],
                    status: 'Error',
                    message: { error: 'Failed to start or connect to RabbitMQ instance', e },
                })

                process.exit(1)
            }

            console.log(`RabbitMQ still down. Sleeping... Will try to connect for the ${tries + 1} time`)
            await sleep(5000)

            return await this.start(queue, tries + 1)
        }
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
