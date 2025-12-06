package dev.ajithgoveas.halochat.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import dev.ajithgoveas.halochat.data.local.dao.MessageDao
import dev.ajithgoveas.halochat.data.local.entity.MessageEntity

@Database(
    entities = [MessageEntity::class],
    version = 1,
    exportSchema = false)

abstract class AppDatabase: RoomDatabase() {
//    abstract fun userDao(): UserDao
    abstract fun messageDao(): MessageDao
}