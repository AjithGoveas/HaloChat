package dev.ajithgoveas.halochat.domain.model

data class Message(
    val id: Int,
    val sender: String,
    val text: String,
    val timestamp: Long,
    val isSent: Boolean,
    val isRead: Boolean
)
