package dev.ajithgoveas.halochat.data.repository

import dev.ajithgoveas.halochat.data.local.dao.MessageDao
import dev.ajithgoveas.halochat.data.local.entity.MessageEntity
import javax.inject.Inject

class MessageRepository @Inject constructor(
    private val messageDao: MessageDao,
//    private val ws: ChatWebSocketService
) {
    // Repository methods for managing messages
    fun getAllMessages() = messageDao.getAllMessages()

    suspend fun insertMessages(entities: List<MessageEntity>) {
        messageDao.insertMessages(entities)
    }

    suspend fun sendMessage(entity: MessageEntity) {
        // 1. Save locally
        messageDao.insertMessage(entity)

        // 2. Push to server
//        ws.send(entity.toWSDto())
    }

    suspend fun markMessageAsRead(id: Int) {
        // 1. Update locally
        messageDao.updateReadStatus(id, true)

        // 2. Optionally notify server
//        ws.sendReadReceipt(id)
    }
}