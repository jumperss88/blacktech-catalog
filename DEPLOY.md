# Deploy Guide

## 1) Pre-deploy checks

Run:

```bash
corepack pnpm run check:deploy
```

This runs:

- TypeScript check
- Integration tests
- Production build

## 2) Environment variables

Required at minimum:

- `PAYLOAD_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_SERVER_URL`
- `PAYLOAD_PUBLIC_SERVER_URL`

For SQLite local file example:

```bash
DATABASE_URL=file:./blacktech-catalog.db
```

## 3) Database and migrations

This project has migration files in [`src/migrations`](src/migrations), but your current local DB was historically created via dev schema push.

Before production deploy, always check migration state:

```bash
corepack pnpm run migrate:status
```

### If deploying to a fresh (empty) DB

Run:

```bash
corepack pnpm run migrate
```

Then start app in production mode.

### If deploying an existing DB snapshot

Do **not** run destructive reset commands.
First back up DB, then verify schema and migration strategy manually. If needed, baseline migration history before enabling regular migrations.

## 4) Build and start

```bash
corepack pnpm run build
corepack pnpm run start
```

## 5) Smoke checks after start

- Open `/`
- Open `/shop`
- Open one product page with gallery
- Open `/admin`
- Create/update one product and verify gallery order/save
