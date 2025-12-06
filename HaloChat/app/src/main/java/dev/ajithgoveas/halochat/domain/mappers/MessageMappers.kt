package dev.ajithgoveas.halochat.domain.mappers

import dev.ajithgoveas.halochat.data.local.entity.MessageEntity
import dev.ajithgoveas.halochat.domain.model.Message

fun MessageEntity.toDomain(): Message = Message(id, sender, text, timestamp, isSent, isRead)
fun Message.toEntity(): MessageEntity = MessageEntity(id, sender, text, timestamp, isSent, isRead)

//fun MessageEntity.toWSDto(): WsMessageDto = WsMessageDto(
//    id = id.toString(),
//    sender = sender,
//    text = text,
//    timestamp = timestamp,
//    type = "chat"
//)
