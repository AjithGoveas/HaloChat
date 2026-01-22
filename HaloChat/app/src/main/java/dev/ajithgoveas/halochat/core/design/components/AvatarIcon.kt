package dev.ajithgoveas.halochat.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun AvatarIcon(
    modifier: Modifier = Modifier,
    imageUrl: String? = null,
    size: Int = 40,
    name: String = "Happy User",
) {
    Box(
        modifier = modifier
            .clip(MaterialTheme.shapes.extraLarge)
            .background(MaterialTheme.colorScheme.primary)
            .size(size.dp),
        contentAlignment = Alignment.Center
    ) {
        if (imageUrl == null) {
            // Show placeholder or initials
            val initials = name.split(" ").joinToString("") { it.take(1) }.uppercase()
            Text(
                text = initials,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onPrimary
            )
        } else {
            // Load and display the image from imageUrl
            // For simplicity, this part is omitted. In a real app, you might use Coil or Glide.
        }
    }
}

@Preview
@Composable
private fun AvatarIconPreview() {
    AvatarIcon(name = "Ajith Goveas")

}