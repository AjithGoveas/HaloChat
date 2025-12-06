main/package
|
|--> core
|    |--> base        // Base classes, common scaffolds, theme setup
|    |--> utils       // Extensions, helpers
|    |--> design      // Typography, colors, shapes, reusable UI components
|
|--> data
|    |--> local       // Room DB, DAO
|    |--> remote      // Retrofit/Ktor services, DTOs
|    |--> repository  // Repository implementations
|
|--> di               // Hilt/Koin modules
|
|--> domain
|    |--> model       // Business models
|    |--> mappers     // DTO ↔ domain conversions
|    |--> usecase     // Business logic
|
|--> feature
|    |--> chat
|    |    |--> ui         // Composables (screens, components)
|    |    |--> viewmodel  // State holders
|    |    |--> navigation // NavGraph for this feature
|    |
|    |--> auth
|    |    |--> ui
|    |    |--> viewmodel
|    |    |--> navigation
|    |
|    |--> profile
|         |--> ui
|         |--> viewmodel
|         |--> navigation
|
|--> navigation        // App-level NavHost, routes
|
|--> testing           // Unit tests, UI tests
