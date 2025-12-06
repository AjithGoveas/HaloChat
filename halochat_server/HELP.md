```txt
halochat-server/
├── package.json
├── .env
├── server.js
├── supabase/
│   └── sql/
│       └── 0001_init.sql
└── src/
    ├── config/
    │   ├── env.js
    │   └── supabase.js
    ├── utils/
    │   └── logger.js
    ├── models/
    │   ├── Message.js
    │   ├── Room.js
    │   └── RoomMember.js
    ├── repositories/
    │   ├── messageRepo.js
    │   └── roomRepo.js
    ├── services/
    │   ├── auth.js
    │   ├── websocket.js
    │   └── realtimeBridge.js
    └── state/
        └── connections.js
```
