import { Message } from "./Database"

type MessageId = string
type WorkerId = number

export class Queue {
  private messages = new Map<MessageId, Message>()
  private processing = new Map<MessageId, WorkerId>()

  Enqueue(message: Message): void {
    this.messages.set(message.id, message)
  }

  Dequeue(workerId: WorkerId): Message | undefined {
    for (const [messageId, message] of this.messages.entries()) {
      if (this.isLocked(message)) continue
      this.lock(messageId, workerId)
      return message
    }
    return undefined
  }

  Confirm(workerId: WorkerId, messageId: MessageId): void {
    if (this.processing.get(messageId) !== workerId) {
      console.error(
        `Worker ${workerId} tried to confirm message ${messageId}, but does not own it.`
      )
      return
    }

    this.messages.delete(messageId)
    this.processing.delete(messageId)
  }

  Size(): number {
    return this.messages.size
  }

  private isLocked(message: Message): boolean {
    for (const lockedId of this.processing.keys()) {
      const lockedMessage = this.messages.get(lockedId)
      if (lockedMessage?.key === message.key) {
        return true
      }
    }
    return false
  }

  private lock(messageId: MessageId, workerId: WorkerId): void {
    this.processing.set(messageId, workerId)
  }
}
