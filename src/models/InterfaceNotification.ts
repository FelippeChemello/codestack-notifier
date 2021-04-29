export interface InterfaceNotification {
    app: string
    destination: string[]
    status: string
    message: { [key: string]: any }
}
