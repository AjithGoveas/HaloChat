package dev.ajithgoveas.halochat.data.repository

import dev.ajithgoveas.halochat.data.local.dao.MessageDao
import dev.ajithgoveas.halochat.data.local.entity.MessageEntity
import dev.ajithgoveas.halochat.data.remote.ws.ChatWebSocketService
import dev.ajithgoveas.halochat.data.remote.ws.SendDmPayload
import dev.ajithgoveas.halochat.data.remote.ws.SendRoomPayload
import dev.ajithgoveas.halochat.data.remote.ws.WsMessageDto
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MessageSyncRepository @Inject constructor(
    private val dao: MessageDao,
    private val ws: ChatWebSocketService
) {
    private val ioScope = CoroutineScope(Dispatchers.IO)

    val connection: Flow<Boolean> = ws.isConnected

    fun bindInboundEvents(eventsFlow: Flow<Any>) {
        // Map inbound DTOs to local persistence
        ioScope.launch {
            eventsFlow.onEach { evt ->
                when (evt) {
                    is WsMessageDto -> {
                        val entity = MessageEntity(
                            id = 0,
                            sender = evt.sender,
                            text = evt.text,
                            timestamp = parseIsoToMillis(evt.createdAt),
                            isSent = evt.sender != null && evt.recipient == null && evt.roomId == null // simplistic
                                    || false,
                            isRead = evt.status == "read"
                        )
                        dao.insertMessage(entity)
                    }

                    is List<*> -> {
                        // sync lists
                        val items = evt.filterIsInstance<WsMessageDto>()
                        val entities = items.map {
                            MessageEntity(
                                id = 0,
                                sender = it.sender,
                                text = it.text,
                                timestamp = parseIsoToMillis(it.createdAt),
                                isSent = it.recipient == null, // naive hint
                                isRead = it.status == "read"
                            )
                        }
                        dao.insertMessages(entities)
                    }
                }
            }.collect { /* no-op */ }
        }
    }

    suspend fun connect(userId: String, token: String? = null) {
        ws.connect(userId, token)
        bindInboundEvents(ws.events)
    }

    suspend fun disconnect() {
        ws.disconnect()
    }

    suspend fun sendDm(sender: String, recipient: String, text: String) {
        // Optimistic local insert
        dao.insertMessage(
            MessageEntity(
                id = 0, sender = sender, text = text,
                timestamp = System.currentTimeMillis(), isSent = true, isRead = false
            )
        )
        // Push to server
        ws.sendDm(SendDmPayload(sender, recipient, text))
    }

    suspend fun sendRoom(sender: String, roomId: String, text: String) {
        dao.insertMessage(
            MessageEntity(
                id = 0, sender = sender, text = text,
                timestamp = System.currentTimeMillis(), isSent = true, isRead = false
            )
        )
        ws.sendRoom(SendRoomPayload(sender, roomId, text))
    }

    suspend fun markDelivered(messageId: String) {
        ws.ackDelivered(messageId)
        // optionally update local status if you track server IDs
    }

    suspend fun markRead(messageId: String, reader: String) {
        ws.ackRead(messageId, reader)
        // update local
        // if you track local by auto-increment id, map later to server uuid
    }

    private fun parseIsoToMillis(iso: String): Long =
        kotlin.runCatching {
            java.time.Instant.parse(iso).toEpochMilli()
        }.getOrDefault(System.currentTimeMillis())
}
