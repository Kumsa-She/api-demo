# Backend — MongoDB configuration

Overview

- The backend uses MongoDB via the official Node.js driver. Connection and pool settings are configured via environment variables.

Environment variables (example)

- `DATABASE_URL` — required: your MongoDB connection string (do not commit secrets).
- `MONGO_MAX_POOL_SIZE` — optional: connections per app process (tune per deployment).
- `MONGO_MIN_POOL_SIZE` — optional.
- `PORT` — optional: server port (default 3000).

Run

```bash
cd backend
npm install
# copy .env.example -> .env and fill secrets, then run
npm run dev
```

Security

- Never commit `.env` or any secret. Use `.env.example` for placeholders and provide real secrets via your deployment pipeline or secret manager.

Scaling notes

- `maxPoolSize` controls connections per Node process. To handle large numbers of concurrent users, scale application instances horizontally and optimize DB queries.

Observability

- Monitor MongoDB server metrics and application latency; adjust pool sizes after load testing.

For more details see internal ops documentation (do not expose connection strings publicly).
