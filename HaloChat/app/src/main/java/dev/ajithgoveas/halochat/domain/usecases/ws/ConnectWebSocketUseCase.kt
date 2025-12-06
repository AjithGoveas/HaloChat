package dev.ajithgoveas.halochat.domain.usecases.ws

import dev.ajithgoveas.halochat.data.repository.MessageSyncRepository
import javax.inject.Inject

class ConnectWebSocketUseCase @Inject constructor(
    private val syncRepo: MessageSyncRepository
) {
    suspend operator fun invoke(userId: String, token: String? = null) {
        syncRepo.connect(userId, token)
    }
}
