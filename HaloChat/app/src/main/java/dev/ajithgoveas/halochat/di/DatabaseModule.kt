package dev.ajithgoveas.halochat.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import dev.ajithgoveas.halochat.data.local.AppDatabase
import dev.ajithgoveas.halochat.data.local.dao.MessageDao
import dev.ajithgoveas.halochat.data.remote.ws.ChatWebSocketService
import dev.ajithgoveas.halochat.data.repository.MessageRepository
import dev.ajithgoveas.halochat.data.repository.MessageSyncRepository
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(
            context = context,
            klass = AppDatabase::class.java,
            name = "halochat_db"
        ).build()

    @Provides
    fun provideMessageDao(db: AppDatabase): MessageDao = db.messageDao()

    @Provides
    @Singleton
    fun provideMessageRepository(dao: MessageDao): MessageRepository =
        MessageRepository(dao)

    @Provides
    @Singleton
    fun provideMessageSyncRepository(
        dao: MessageDao,
        ws: ChatWebSocketService
    ): MessageSyncRepository =
        MessageSyncRepository(dao, ws)
}