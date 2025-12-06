package dev.ajithgoveas.halochat.data.remote.ws

import kotlinx.serialization.Serializable

@Serializable
data class WsEvent(
    val event: String, // e.g., "message", "ack", "error"
    val payload: WsMessageDto? = null
)
