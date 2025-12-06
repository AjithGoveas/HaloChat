package dev.ajithgoveas.halochat.domain.usecases.messages

import dev.ajithgoveas.halochat.data.repository.MessageSyncRepository
import dev.ajithgoveas.halochat.domain.model.Message
import javax.inject.Inject

class SendMessageUseCase @Inject constructor(
    private val syncRepo: MessageSyncRepository
) {
    suspend operator fun invoke(
        message: Message,
        recipient: String? = null,
        roomId: String? = null
    ) {
        if (recipient != null) {
            syncRepo.sendDm(message.sender, recipient, message.text)
        } else if (roomId != null) {
            syncRepo.sendRoom(message.sender, roomId, message.text)
        } else {
            error("Recipient or roomId required")
        }
    }
}
