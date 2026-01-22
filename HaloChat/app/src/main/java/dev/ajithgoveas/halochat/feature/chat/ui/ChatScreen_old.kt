package dev.ajithgoveas.halochat.feature.chat.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import dev.ajithgoveas.halochat.R
import dev.ajithgoveas.halochat.core.utils.formatTime
import dev.ajithgoveas.halochat.domain.model.Message
import dev.ajithgoveas.halochat.core.design.theme.HaloChatTheme
import dev.ajithgoveas.halochat.feature.chat.viewmodel.ChatViewModel

// Let's have a dummy message conversation for now
// In a real app, this would be replaced with a list of messages from a ViewModel
// and the ChatMessagesList would display them accordingly.
// For now, we will just display a placeholder text.
/*
data class Message(
    val id: Int,
    val sender: String,
    val text: String,
    val timestamp: Long,
    val isSent: Boolean,
    val isRead: Boolean = false
)

val sampleMessages = listOf(
    Message(
        11,
        "Ajith",
        "Hey, did you finish the DSA problem for today?",
        System.currentTimeMillis(),
        true,
        true
    ),
    Message(
        10,
        "Ravi",
        "Yeah, I solved the recursion one. Took me a while though 😅",
        System.currentTimeMillis(),
        false,
        true
    ),
    Message(
        9,
        "Ajith",
        "Haha same here. By the way, are you free this weekend? We can work on the chat app MVP.",
        System.currentTimeMillis(),
        true,
        true
    ),
    Message(
        8,
        "Ajith",
        "Haha same here. By the way, are you free this weekend? We can work on the chat app MVP. Haha same here. By the way, are you free this weekend? We can work on the chat app MVP. Haha same here. By the way, are you free this weekend? We can work on the chat app MVP.",
        System.currentTimeMillis(),
        true,
        true
    ),
    Message(
        7,
        "Ravi",
        "Sure, Saturday morning works. Let’s set up the WebSocket server first.",
        System.currentTimeMillis(),
        false,
        true
    ),
    Message(
        6,
        "Ajith",
        "Perfect. I’ll handle the Compose UI. You can take care of the Node.js backend?",
        System.currentTimeMillis(),
        true,
        true
    ),
    Message(
        5,
        "Ravi",
        "Deal. Let’s sync on GitHub later tonight.",
        System.currentTimeMillis(),
        false,
        true
    ),
    Message(4, "Ajith", "Sounds good! Catch you later then.", System.currentTimeMillis(), true),
    Message(3, "Ravi", "See you! 😊", System.currentTimeMillis(), false),
    Message(
        2,
        "Ajith",
        "Oh, and don’t forget to bring your laptop charger. Mine is acting up again.",
        System.currentTimeMillis(),
        true
    ),
    Message(
        1,
        "Ravi",
        "Haha, I always forget that. Thanks for the reminder! I’ll bring mine too.",
        System.currentTimeMillis(),
        false
    )
)

 */

@Composable
fun ChatScreen(
    modifier: Modifier = Modifier,
    username: String
) {
    val chatViewModel = hiltViewModel<ChatViewModel>()
    LaunchedEffect(username) {
        chatViewModel.connectWebSocket(username = username)
    }

    val messages = chatViewModel.messages.collectAsState()
    var inputMessage by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        ChatMessagesList(
            messages = messages.value,
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 8.dp)
        )
        ChatInputField(
            message = inputMessage,
            onMessageChange = { inputMessage = it },
            // In onMessageSent:
            onMessageSent = {
                if (inputMessage.isNotBlank()) {
                    chatViewModel.sendMessage(
                        sender = username,
                        text = inputMessage.trim(),
                        recipient = "Ravi"
                    )
                    inputMessage = ""
                }
            }
        )
//        For room chat:
//        chatViewModel.sendMessage(sender = "Ajith", text = inputMessage.trim(), roomId = roomUuid)
    }
}

@Composable
private fun ChatMessagesList(
    modifier: Modifier,
    messages: List<Message>
) {
    LazyColumn(
        reverseLayout = true,
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(messages) { message ->
            ChatBubble(message = message, isUserMessage = message.isSent)
        }
    }
}

@Composable
fun ChatBubble(message: Message, isUserMessage: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUserMessage) Arrangement.End else Arrangement.Start
    ) {
        Card(
            shape = if (isUserMessage) {
                RoundedCornerShape(
                    topStart = 12.dp,
                    topEnd = 0.dp,
                    bottomStart = 12.dp,
                    bottomEnd = 12.dp
                )
            } else {
                RoundedCornerShape(
                    topStart = 0.dp,
                    topEnd = 12.dp,
                    bottomStart = 12.dp,
                    bottomEnd = 12.dp
                )
            },
            colors = if (isUserMessage) {
                CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer) // WhatsApp green
            } else {
                CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
            },
            modifier = Modifier.widthIn(max = 300.dp)
        ) {
            Box(modifier = Modifier.padding(8.dp)) {
                Text(
                    text = message.text,
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(end = 48.dp) // leave space for timestamp
                )
                Row(
                    modifier = Modifier.align(Alignment.BottomEnd),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = formatTime(message.timestamp),
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                    if (isUserMessage) {
                        Icon(
                            painter = if (message.isRead) painterResource(R.drawable.done_all_24px)
                            else painterResource(R.drawable.check_24px),
                            contentDescription = if (message.isRead) "Read" else "Delivered",
                            tint = if (message.isRead) Color.Blue else Color.Gray,
                            modifier = Modifier
                                .size(16.dp)
                                .padding(start = 2.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatInputField(
    message: String,
    onMessageChange: (String) -> Unit,
    onMessageSent: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        TextField(
            value = message,
            onValueChange = onMessageChange,
            placeholder = { Text("Message") },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(24.dp),
            colors = TextFieldDefaults.colors(
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                disabledIndicatorColor = Color.Transparent
            )
        )
        IconButton(
            onClick = onMessageSent,
            modifier = Modifier
                .size(48.dp)
                .background(
                    color = MaterialTheme.colorScheme.primary,
                    shape = RoundedCornerShape(24.dp)
                )
        ) {
            Icon(
                painter = painterResource(R.drawable.send_24px),
                contentDescription = "Send Message",
                tint = MaterialTheme.colorScheme.onPrimary
            )
        }
    }
}

@Preview
@Composable
fun ChatScreenPreview() {
    HaloChatTheme {
        ChatScreen(modifier = Modifier.fillMaxSize(), username = "Ajith")
    }
}
