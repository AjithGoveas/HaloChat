package dev.ajithgoveas.halochat.data.remote.ws

import io.ktor.client.HttpClient
import io.ktor.client.plugins.websocket.ws
import io.ktor.websocket.Frame
import io.ktor.websocket.close
import io.ktor.websocket.readText
import io.ktor.websocket.send
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatWebSocketService @Inject constructor(
    private val client: HttpClient,
    private val json: Json
) {
    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _events = MutableSharedFlow<Any>(
        replay = 0, extraBufferCapacity = 128, onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<Any> = _events.asSharedFlow()

    // Replace with your deployed server URL
    private val serverUrl = "wss://halo-chat.example.com/ws/chat"

    suspend fun connect(userId: String, token: String? = null) = coroutineScope {
        if (_isConnected.value) return@coroutineScope
        client.ws(serverUrl) {
            _isConnected.value = true

            // Identify connection
            send(
                json.encodeToString(
                    WsEnvelope(
                        type = "hello", payload = mapOf(
                            "user_id" to userId,
                            "token" to token
                        )
                    )
                )
            )

            // Reader
            val reader = launch {
                try {
                    for (frame in incoming) {
                        if (frame is Frame.Text) {
                            val text = frame.readText()
                            // Envelope: { event: "...", payload: ... }
                            val node = json.parseToJsonElement(text)
                            val event = node.jsonObject["event"]?.toString()?.trim('"')
                            val payload = node.jsonObject["payload"]?.toString()
                            when (event) {
                                "message" -> payload?.let {
                                    _events.tryEmit(json.decodeFromString<WsMessageDto>(it))
                                }

                                "status" -> payload?.let {
                                    _events.tryEmit(json.decodeFromString<WsMessageDto>(it))
                                }

                                "read_receipt" -> payload?.let {
                                    _events.tryEmit(json.decodeFromString<WsReadReceiptDto>(it))
                                }

                                "sync_dm" -> payload?.let {
                                    val list = json.decodeFromString<List<WsMessageDto>>(it)
                                    _events.tryEmit(list)
                                }

                                "sync_room" -> payload?.let {
                                    val list = json.decodeFromString<List<WsMessageDto>>(it)
                                    _events.tryEmit(list)
                                }

                                else -> _events.tryEmit(text) // diagnostic
                            }
                        }
                    }
                } catch (e: CancellationException) {
                    // normal
                } finally {
                    _isConnected.value = false
                }
            }

            // Keepalive pings (optional)
            val pinger = launch {
                while (isActive) {
                    send(Frame.Text("""{"type":"ping"}"""))
                    kotlinx.coroutines.delay(30_000)
                }
            }

            // Suspend until socket closes from either side
            reader.join()
            pinger.cancel()
            close()
            _isConnected.value = false
        }
    }

    suspend fun disconnect() {
        // Ktor client closes when ws block ends; nothing explicit to do here.
        _isConnected.value = false
    }

    // Outbound helpers
    suspend fun sendDm(payload: SendDmPayload) {
        val envelope = WsEnvelope(type = "send_dm", payload = payload)
        client.ws(serverUrl) { send(json.encodeToString(envelope)) }
    }

    suspend fun sendRoom(payload: SendRoomPayload) {
        val envelope = WsEnvelope(type = "send_room", payload = payload)
        client.ws(serverUrl) { send(json.encodeToString(envelope)) }
    }

    suspend fun ackDelivered(messageId: String) {
        val envelope = WsEnvelope(type = "ack_delivered", payload = AckDeliveredPayload(messageId))
        client.ws(serverUrl) { send(json.encodeToString(envelope)) }
    }

    suspend fun ackRead(messageId: String, reader: String) {
        val envelope = WsEnvelope(type = "ack_read", payload = AckReadPayload(messageId, reader))
        client.ws(serverUrl) { send(json.encodeToString(envelope)) }
    }

    suspend fun syncDm(peerA: String, peerB: String, limit: Int = 100) {
        val envelope = WsEnvelope(type = "sync_dm", payload = SyncDmPayload(peerA, peerB, limit))
        client.ws(serverUrl) { send(json.encodeToString(envelope)) }
    }

    suspend fun syncRoom(roomId: String, limit: Int = 100) {
        val envelope = WsEnvelope(type = "sync_room", payload = SyncRoomPayload(roomId, limit))
        client.ws(serverUrl) { send(json.encodeToString(envelope)) }
    }
}

