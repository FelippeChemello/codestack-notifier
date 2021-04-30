require('dotenv').config()

import { InterfaceNotification } from './models/InterfaceNotification'

import EmailService from './services/EmailService'
import RabbitService from './services/RabbitService'

main()

async function main() {
    const rabbitService = new RabbitService()
    await rabbitService.start('notify')

    const emailService = new EmailService()

    console.log("Waiting for messages on 'notify' queue")

    rabbitService.consume('notify', message => {
        const notification = JSON.parse(message.content.toString()) as InterfaceNotification

        notification.destination.forEach((destination, index, array) => {
            switch (destination) {
                case 'email':
                    emailService.sendMail(notification)
            }
        })
    })
}
