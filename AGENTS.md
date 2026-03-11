# AGENTS.md

Этот файл фиксирует устойчивые правила разработки для проекта `blacktech-catalog`.
Источник истины: текущий код в `src/` + фактическая схема/данные в `blacktech-catalog.db`.

## 1) Текущий стек (по коду)
- Next.js 15.4.11 (App Router), React 19.2.1, TypeScript 5.7 (`strict: true`)
- Payload CMS 3.76.0 + `@payloadcms/next`
- База данных: SQLite через `@payloadcms/db-sqlite`
- Плагины: ecommerce, seo, form-builder
- Rich text: Lexical
- UI: Tailwind CSS v4 + Radix/shadcn + кастомный CSS в `src/app/(app)/globals.css`
- Платежи: Stripe adapter в ecommerce plugin

## 2) Структура
- `src/app/(app)` — публичный сайт
- `src/app/(payload)` — Payload admin и API route handlers
- `src/collections` — core collections
- `src/globals` — global docs (`home`, `header`, `footer`)
- `src/blocks` — layout-builder blocks
- `src/components` — frontend/admin компоненты
- `src/access`, `src/hooks`, `src/utilities` — бизнес-логика
- `scripts/` — одноразовые миграционные и контентные скрипты
- `docs/` — актуальная спецификация проекта

## 3) Непереговорные правила безопасности и целостности
1. Если Local API вызывается с `user`, всегда указывать `overrideAccess: false`.
2. Во всех nested-операциях в hooks передавать `req` для транзакционной целостности.
3. Для операций внутри hooks, которые могут триггерить те же hooks, использовать `context`-флаги от зацикливания.
4. Не ослаблять access-контроль коллекций `users`, `requests`, `contact-messages`, `pages`.
5. Публичные endpoint’ы записи (`/api/requests/submit`, `/api/contact-messages/submit`) менять только с явной валидацией входных данных.

## 4) Обязательные действия при изменениях схемы
1. После изменения коллекций/глобалов/блоков/полей: `corepack pnpm run generate:types`
2. После изменения admin-компонентов/путей компонентов: `corepack pnpm run generate:importmap`
3. Проверка типов: `corepack pnpm run check:types`
4. Если есть структурные изменения БД: проверить `corepack pnpm run migrate:status` и поддерживать миграции в `src/migrations`.

## 5) Инварианты frontend/backend
1. Главная страница берется из global `home`, а не из `pages/home`.
2. Страницы по slug рендерятся через `src/app/(app)/[slug]/page.tsx`; не дублировать route без необходимости.
3. `products` используют:
   - `gallery` как `upload hasMany`
   - `brand + model -> title` (собирается hook’ом)
   - `specifications` с авто-группировкой.
4. Отображение цен — в рублях (`₽`) через `Price` (с конвертацией из minor units по `decimals`).
5. Для slugs на русском используется `slugifyRussian`; не вводить другую логику транслитерации в обход этого utility.

## 6) Текущие открытые задачи (зафиксировать перед дальнейшей разработкой)
1. Унифицировать устаревшие пути:
   - `LoginForm` ведет на `/recover-password`, а маршрут существует как `/forgot-password`.
   - `ConfirmOrder` редиректит на `/shop/order/:id`, но фактический маршрут заказа `/orders/[id]`.
   - В проекте остаются legacy-ссылки на `/search`, тогда как рабочий каталог — `/shop`.
2. Убрать рассинхрон slug/страниц сервисного центра:
   - CMS-страница: `/servisnii-tsentr`
   - Статический route: `/servisnyy-centr`
3. Привести ссылки футера к актуальным страницам (`/kontakty` vs `/goszakupki-44-fz-223-fz`).
4. Обновить устаревший `.env.example` (сейчас указан MongoDB URL, проект работает на SQLite).
5. Актуализировать e2e-тесты под текущую навигацию и тексты UI.

## 7) Рабочий процесс
1. Сначала проверять факты в коде, не в старых тредах и не в шаблонном `README.md`.
2. При изменении поведения фиксировать изменения в:
   - `docs/project-spec.md`
   - `docs/design-rules.md`
   - `docs/content-structure.md`
3. Не удалять и не переписывать автогенерируемые файлы из `src/app/(payload)` вручную.

## 8) Как запустить проект локально
### Prerequisites
- Node.js: `^18.20.2 || >=20.9.0` (см. `package.json -> engines`)
- Package manager: `corepack` + `pnpm` (скрипты проекта используют `corepack pnpm ...`)
- `npm`-ориентированный workflow: `UNCONFIRMED` (в репозитории есть `pnpm-lock.yaml`, `package-lock.json` отсутствует)

### Установка зависимостей
- Основная команда: `corepack pnpm run ii`
  - Скрипт `ii` = `corepack pnpm --ignore-workspace install`

### Запуск в dev
- `corepack pnpm run dev` — поднимает сайт и Payload admin в одном Next.js процессе.
- Раздельные dev-команды для frontend/admin: `NOT PRESENT`.

### Локальные URL
- Сайт: `http://localhost:3000`
- Админка Payload: `http://localhost:3000/admin`

### Обязательные env-переменные
- Файл-пример: `.env.example` (учитывать, что он частично устарел)
- Минимум для старта приложения по конфигу:
  - `PAYLOAD_SECRET`
  - `DATABASE_URL` (проект использует SQLite через `@payloadcms/db-sqlite`)
- Для ecommerce/Stripe-флоу дополнительно обязательны:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOKS_SIGNING_SECRET`
- Точный SQLite-формат `DATABASE_URL` в `.env.example`: `UNCONFIRMED` (сейчас там указан MongoDB URL).

## 9) Проверки перед коммитом / перед деплоем
### Точные команды
- Lint: `corepack pnpm run lint`
- Typecheck (`tsc --noEmit`): `corepack pnpm run check:types`
- Тесты:
  - integration: `corepack pnpm run test:int`
  - e2e: `corepack pnpm run test:e2e`
  - оба набора: `corepack pnpm run test`
- Build: `corepack pnpm run build`

### Когда запускать
- Минимум перед коммитом:
  - `corepack pnpm run lint`
  - `corepack pnpm run check:types`
  - `corepack pnpm run test:int`
- Полный прогон перед деплоем:
  - `corepack pnpm run lint`
  - `corepack pnpm run check:deploy` (включает `check:types`, `test:int`, `build`)
  - `corepack pnpm run test:e2e`

### После изменения Payload schema (только существующие команды)
- `corepack pnpm run generate:types`
- `corepack pnpm run generate:importmap` (если менялись admin-компоненты/пути компонентов)
- `corepack pnpm run migrate:status`
- При наличии ожидающих миграций: `corepack pnpm run migrate`
- Финальная проверка: `corepack pnpm run check:types`

## 10) Когда документацию обновлять обязательно
1. Изменились routes (новые, удаленные, переименованные, редиректы):
   - обновить минимум `docs/project-spec.md` и `docs/content-structure.md`.
2. Изменились модели Payload (collections/globals/blocks/поля/access/hooks):
   - обновить минимум `docs/project-spec.md` и `docs/content-structure.md`.
3. Изменились UI токены/стили/дизайн-правила:
   - обновить минимум `docs/design-rules.md`.
4. Изменились публичные endpoint’ы или формы (`/api/*`, payload submit routes, валидации/контракты):
   - обновить минимум `docs/project-spec.md` и `docs/content-structure.md`.

## 11) Project skills
### Список skills и назначение
1. `blacktech-docs-guard` — синхронизация `docs/*` по уже подтвержденным изменениям в коде и конфиге.
2. `blacktech-page-block` — разработка и изменение block-layer (`home/pages/products`) без выхода за его границы.
3. `blacktech-payload-schema-change` — безопасные изменения schema/data-contract в Payload (collections/globals/blocks/access/hooks/migrations).
4. `blacktech-release-check` — release-gate проверка и отчет `ready/not ready` без правок кодовой базы.

### Как вызывать
1. Указывать skill в запросе через префикс `$`: `$blacktech-docs-guard`.
2. Для block-layer задач: `$blacktech-page-block`.
3. Для schema/data-contract задач: `$blacktech-payload-schema-change`.
4. Для release-gate проверки: `$blacktech-release-check`.

### Порядок чтения контекста (обязательно)
1. Сначала читать `docs/ops-runbook.md`.
2. Затем читать профильные docs под задачу: `docs/project-spec.md`, `docs/content-structure.md`, `docs/design-rules.md` и соответствующий `.agents/skills/**/SKILL.md`.

### Когда skills использовать нельзя (примеры)
1. Задача не соответствует scope skill (пример: нужен checkout/API fix, а выбран `blacktech-docs-guard`).
2. Пользователь запретил обязательные действия skill (пример: запретил проверки, значит нельзя применять `blacktech-release-check`).
3. Требуются изменения вне allowlist skill (пример: `blacktech-page-block` не используется для правок route-файлов в `src/app/**`).
4. Факты не подтверждены кодом/конфигом (пример: нельзя делать docs-sync по неподтвержденным изменениям).
5. Нужны миграции/деплой/операции с данными вместо режима skill (пример: `blacktech-release-check` не выполняет деплой и не запускает `migrate` без явного запроса).
