package dev.ajithgoveas.halochat

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class HaloChatApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialization code if needed
    }
}