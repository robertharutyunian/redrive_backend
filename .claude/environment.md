# Environment

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/redrive_dev   # required
CORS_ORIGIN=http://localhost:3001                                        # optional, comma-separated allowed origins; falls back to "*" if unset
JWT_SECRET=<long-random-string>                                          # required by AuthModule, used to sign/verify login tokens
JWT_EXPIRES_IN=7d                                                         # optional, defaults to "7d"
```

`ConfigModule` is global — all modules access config via `ConfigService`.
