# Environment

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/redrive_dev   # required
CORS_ORIGIN=http://localhost:3001                                        # optional, comma-separated allowed origins; falls back to "*" if unset
```

`ConfigModule` is global — all modules access config via `ConfigService`.
