package dev.ajithgoveas.halochat.presentation.screens.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.ajithgoveas.halochat.domain.model.Message
import dev.ajithgoveas.halochat.domain.usecases.messages.GetMessagesUseCase
import dev.ajithgoveas.halochat.domain.usecases.messages.MarkMessageReadUseCase
import dev.ajithgoveas.halochat.domain.usecases.messages.SendMessageUseCase
import dev.ajithgoveas.halochat.domain.usecases.ws.ConnectWebSocketUseCase
import dev.ajithgoveas.halochat.domain.usecases.ws.DisconnectWebSocketUseCase
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val getMessages: GetMessagesUseCase,
    private val sendMessageUseCase: SendMessageUseCase,
    private val markMessageReadUseCase: MarkMessageReadUseCase,
    private val connectWs: ConnectWebSocketUseCase,
    private val disconnectWs: DisconnectWebSocketUseCase
) : ViewModel() {

    val messages = getMessages()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun connectWebSocket(username: String) {
        viewModelScope.launch {
            connectWs(userId = username, token = null)
        }
    }

    fun sendMessage(
        sender: String,
        text: String,
        recipient: String? = null,
        roomId: String? = null
    ) {
        val msg = Message(
            id = 0,
            sender = sender,
            text = text,
            timestamp = System.currentTimeMillis(),
            isSent = true,
            isRead = false
        )
        viewModelScope.launch {
            sendMessageUseCase(msg, recipient = recipient, roomId = roomId)
        }
    }

    fun markRead(serverMessageId: String, reader: String) {
        viewModelScope.launch {
            markMessageReadUseCase(serverMessageId, reader)
        }
    }

    override fun onCleared() {
        super.onCleared()
        viewModelScope.launch { disconnectWs() }
    }
}
