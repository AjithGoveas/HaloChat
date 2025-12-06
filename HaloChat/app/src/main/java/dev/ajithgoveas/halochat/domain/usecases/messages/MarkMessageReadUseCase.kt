package dev.ajithgoveas.halochat.domain.usecases.messages

import dev.ajithgoveas.halochat.data.repository.MessageSyncRepository
import javax.inject.Inject

class MarkMessageReadUseCase @Inject constructor(
    private val syncRepo: MessageSyncRepository
) {
    suspend operator fun invoke(serverMessageId: String, reader: String) {
        syncRepo.markRead(serverMessageId, reader)
    }
}
