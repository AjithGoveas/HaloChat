package dev.ajithgoveas.halochat.domain.usecases.messages

import dev.ajithgoveas.halochat.data.repository.MessageRepository
import dev.ajithgoveas.halochat.domain.mappers.toDomain
import dev.ajithgoveas.halochat.domain.model.Message
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class GetMessagesUseCase @Inject constructor(private val repository: MessageRepository) {
    operator fun invoke(): Flow<List<Message>> =
        repository.getAllMessages().map { list -> list.map { it.toDomain() } }
}
