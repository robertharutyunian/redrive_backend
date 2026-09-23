# Environment

One required env variable:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/redrive_dev
```

`ConfigModule` is global — all modules access config via `ConfigService`.
