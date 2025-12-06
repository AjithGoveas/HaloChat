package dev.ajithgoveas.halochat.data.remote.ws

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class WsEnvelope<T>(
    val type: String,
    val payload: T? = null
)

// Outbound payloads
@Serializable
data class SendDmPayload(
    val sender: String,
    val recipient: String,
    val text: String
)

@Serializable
data class SendRoomPayload(
    @SerialName("sender") val sender: String,
    @SerialName("room_id") val roomId: String,
    val text: String
)

@Serializable
data class AckDeliveredPayload(val messageId: String)

@Serializable
data class AckReadPayload(val messageId: String, val reader: String)

@Serializable
data class SyncDmPayload(val peerA: String, val peerB: String, val limit: Int = 100)

@Serializable
data class SyncRoomPayload(@SerialName("room_id") val roomId: String, val limit: Int = 100)

// Inbound message from server
@Serializable
data class WsMessageDto(
    val id: String,
    val sender: String,
    val recipient: String? = null,
    @SerialName("room_id") val roomId: String? = null,
    val text: String,
    val status: String, // sent | delivered | read
    @SerialName("created_at") val createdAt: String
)

// Inbound read receipt
@Serializable
data class WsReadReceiptDto(
    val id: String,
    @SerialName("message_id") val messageId: String,
    val reader: String,
    @SerialName("read_at") val readAt: String
)
