import nodeMailer, { Transporter } from 'nodemailer'

import { InterfaceNotification } from '../models/InterfaceNotification'

export default class EmailService {
    private mailTo: string
    private mailFrom: string
    private mailer: Transporter

    constructor() {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('Error at loading SMTP auth')
            process.exit(1)
        }

        this.mailTo = 'felippechemello@gmail.com'
        this.mailFrom = 'felippe@codestack.me'

        this.mailer = nodeMailer.createTransport({
            host: 'smtpi.kinghost.net',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })
    }

    async sendMail(notification: InterfaceNotification) {
        console.log(notification)

        const info = await this.mailer.sendMail({
            from: this.mailFrom,
            to: this.mailTo,
            subject: `${notification.status} em ${notification.app}`,
            text: JSON.stringify(notification.message),
        })

        console.log(info)
    }
}
