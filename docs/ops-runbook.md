# Ops Runbook (`blacktech-catalog`)

Снимок актуален на `2026-03-05`.  
Источник: `AGENTS.md`, `docs/project-spec.md`, `docs/content-structure.md`, `docs/design-rules.md`.

## 1. Быстрый старт (локальный запуск)

## 1.1 Требования
- Node.js: `^18.20.2 || >=20.9.0`
- `corepack` + `pnpm`
- База: SQLite (`@payloadcms/db-sqlite`)

## 1.2 Env минимум
Обязательные переменные:
- `PAYLOAD_SECRET`
- `DATABASE_URL` (SQLite URL для адаптера в `src/payload.config.ts`)

Для ecommerce/Stripe дополнительно:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOKS_SIGNING_SECRET`

Важно:
- `.env.example` устарел (там MongoDB URL), использовать как шаблон ключей, но не как источник корректного `DATABASE_URL`.

## 1.3 Команды
```bash
corepack pnpm run ii
corepack pnpm run dev
```

Локальные URL:
- каноничный release/e2e base URL: `http://127.0.0.1:3000`
- сайт: `http://127.0.0.1:3000`
- админка: `http://127.0.0.1:3000/admin`

## 1.4 Минимальный smoke-check после старта
```bash
corepack pnpm run check:types
corepack pnpm run lint
```

Перед деплоем:
```bash
corepack pnpm run test:e2e:install-browsers
corepack pnpm run check:deploy
```

Правило для QA/release-check:
- проверка идет только через `http://127.0.0.1:3000`
- `dev`, `test:e2e` и `check:deploy` закреплены на порту `3000`

---

## 2. Что где редактируется в админке

## 2.1 Globals (основной контент сайта)
- `home`: контент главной (`hero`, `layout`, `meta`).
- `header`: верхнее меню (`navItems`) и набор категорий в dropdown (`catalogCategories`).
- `footer`: контакты, CTA, нижняя навигация.

## 2.2 Core Collections
- `pages`: CMS-страницы по `slug` (`hero`, `layout`, `meta`, `_status`).
- `categories`: дерево каталога (`title`, `slug`, `parentCategory`, `catalogImage`, `dropdownImage`).
- `media`: медиа-файлы.
- `users`: пользователи/роли.
- `requests`: входящие заявки с `/checkout`.
- `contact-messages`: сообщения из формы контактов.

## 2.3 Ecommerce Collections (через plugin)
- `products`, `variants`, `variantTypes`, `variantOptions`, `carts`, `orders`, `transactions`, `addresses`.

Примечание по `products`:
- `title` собирается hook-ом из `brand + model`.
- `gallery` = `upload hasMany`.
- характеристики (`specifications`) группируются автоматически.

## 2.4 Публичные формы, которые пишут в админку
- `POST /api/requests/submit` -> `requests`
- `POST /api/contact-messages/submit` -> `contact-messages`

---

## 3. Где какие страницы и компоненты

## 3.1 Ключевые route-файлы (frontend)
- `/` -> `src/app/(app)/page.tsx` (реэкспорт рендера из `[slug]`, данные из `global home`)
- `/[slug]` -> `src/app/(app)/[slug]/page.tsx` (страницы из `pages`)
- `/catalog` -> `src/app/(app)/catalog/page.tsx`
- `/shop` -> `src/app/(app)/shop/page.tsx`
- `/products/[slug]` -> `src/app/(app)/products/[slug]/page.tsx`
- `/checkout` -> `src/app/(app)/checkout/page.tsx`
- `/checkout/confirm-order` -> `src/app/(app)/checkout/confirm-order/page.tsx`
- `/login`, `/create-account`, `/forgot-password`, `/logout`
- `/account`, `/account/addresses`
- `/orders`, `/orders/[id]`
- `/find-order`

Статические placeholder routes:
- `/portfolio`
- `/goszakupki-44-fz-223-fz`
- `/servisnyy-centr` (дублирует CMS-тему сервиса по смыслу)

## 3.2 Ключевые компоненты
- Общий layout: `src/app/(app)/layout.tsx`
- Header: `src/components/Header/*`
- Footer: `src/components/Footer/*`
- Рендер блоков: `src/blocks/RenderBlocks.tsx`
- Страница товара: `src/components/product/*`
- Каталог/карточки: `src/components/ProductGridItem/index.tsx`
- Checkout: `src/components/checkout/CheckoutPage.tsx`
- Контакты форма: `src/blocks/ContactsHub/Form.client.tsx`

## 3.3 Где API handlers
- `src/app/(app)/api/requests/submit/route.ts`
- `src/app/(app)/api/contact-messages/submit/route.ts`
- Payload REST/GraphQL: `src/app/(payload)/api/[...slug]/route.ts`

---

## 4. Top-10 правил “не ломать”

1. Главная всегда берется из `global home`, не из `pages/home`.
2. Для Local API с `user` обязательно `overrideAccess: false`.
3. Во всех nested-операциях hooks передавать `req` (транзакционная целостность).
4. В hook-цепочках использовать `context`-флаги от рекурсии/зацикливания.
5. Не ослаблять access-контроль у `users`, `requests`, `contact-messages`, `pages`.
6. Публичные submit endpoints (`/api/requests/submit`, `/api/contact-messages/submit`) менять только с явной валидацией входа.
7. В `products` не ломать инварианты: `gallery` как `upload hasMany`, `brand+model -> title`, авто-группировка `specifications`.
8. Для русских slug использовать только `slugifyRussian`.
9. Не ломать дизайн-токены и базовые UX-паттерны из `globals.css` (focus-visible, container/breakpoints, product typography).
10. После изменений схемы Payload обязательно: `generate:types`, при admin-path изменениях `generate:importmap`, затем `check:types` и `migrate:status` при структурных изменениях БД.

---

## 5. Текущий backlog (конкретные пункты)

1. Исправить ссылку в `LoginForm`: `/recover-password` -> `/forgot-password`.
2. Исправить редирект в confirm-order flow: `/shop/order/:id` -> `/orders/[id]`.
3. Убрать legacy-ссылки на `/search`, привести на рабочий каталог `/shop`.
4. Синхронизировать сервисный центр: выбрать один slug/route между `/servisnii-tsentr` (CMS) и `/servisnyy-centr` (статический).
5. Привести footer links к актуальной контактной странице (`/kontakty`), убрать рассинхрон с `/goszakupki-44-fz-223-fz`.
6. Обновить `.env.example` под SQLite вместо MongoDB URL.
7. Актуализировать e2e-тесты под текущие маршруты и тексты интерфейса.
8. Закрыть вопрос с `sitemap.xml`: добавить/подтвердить рабочий route-генератор.
