export type MessageType = 'success' | 'error' | 'warning' | 'info'
export type ToastMessage = {
    message: string,
    type: MessageType
}