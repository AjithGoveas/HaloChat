package dev.ajithgoveas.halochat.domain.usecases.ws

import dev.ajithgoveas.halochat.data.repository.MessageSyncRepository
import javax.inject.Inject

class DisconnectWebSocketUseCase @Inject constructor(
    private val syncRepo: MessageSyncRepository
) {
    suspend operator fun invoke() {
        syncRepo.disconnect()
    }
}
