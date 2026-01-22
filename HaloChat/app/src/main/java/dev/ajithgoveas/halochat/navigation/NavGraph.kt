package dev.ajithgoveas.halochat.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import dev.ajithgoveas.halochat.presentation.screens.chat.ChatScreen
import dev.ajithgoveas.halochat.presentation.screens.home.HomeScreen
import dev.ajithgoveas.halochat.presentation.screens.username.UsernameScreen
import dev.ajithgoveas.halochat.presentation.screens.welcome.WelcomeScreen

sealed class Screen(val route: String) {
    object Welcome : Screen("welcome")
    object Username : Screen("username")
    object Home : Screen("home")
    object Chat : Screen("chat/{username}") {
        fun createRoute(username: String) = "chat/$username"
    }
}

@Composable
fun NavGraph(navController: NavHostController, modifier: Modifier = Modifier) {
    NavHost(
        navController = navController,
        startDestination = Screen.Welcome.route,
        modifier = modifier
    ) {
        composable(Screen.Welcome.route) {
            WelcomeScreen(onContinue = { navController.navigate(Screen.Username.route) })
        }
        composable(Screen.Username.route) {
            UsernameScreen(onUsernameChosen = { username ->
                navController.navigate(Screen.Home.route)
            })
        }
        composable(Screen.Home.route) {
            HomeScreen(onContactClick = { contact ->
                navController.navigate(Screen.Chat.createRoute(contact.name))
            })
        }

        composable(Screen.Chat.route) { backStackEntry ->
            val username = backStackEntry.arguments?.getString("username") ?: "Guest"
            ChatScreen(username = username)
        }
    }
}
