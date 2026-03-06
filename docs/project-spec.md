# Спецификация проекта (`blacktech-catalog`)

Снимок актуален на **2026-03-05** и собран по коду/БД проекта, без опоры на старые треды.

## 1. Назначение
Проект — B2B-каталог светового оборудования на Payload + Next.js.
Ключевой сценарий: пользователь собирает позиции в «заявку» (cart UI) и отправляет запрос менеджеру, а не оформляет классический consumer checkout.

## 2. Технологический стек
- **Frontend:** Next.js `15.4.11` (App Router), React `19.2.1`, TypeScript `5.7.2`
- **Backend/CMS:** Payload `3.76.0`, `@payloadcms/next`
- **DB:** SQLite через `@payloadcms/db-sqlite` (`blacktech-catalog.db`)
- **Editor:** Lexical (`@payloadcms/richtext-lexical`)
- **Payload plugins:** ecommerce, seo, form-builder
- **UI:** Tailwind CSS v4, Radix UI, shadcn-style components, кастомный CSS
- **Платежи:** Stripe adapter (в ecommerce plugin)
- **Тесты:** Vitest (integration), Playwright (e2e)

## 3. Архитектура
### 3.1 Frontend
- App Router в `src/app/(app)`.
- Корневой layout: глобальные провайдеры, `Header`, `Footer`, admin bar, live preview listener.
- Контентные страницы строятся через Payload blocks (`RenderBlocks`) и hero-секции (`RenderHero`).
- Каталог и карточка товара реализованы отдельными route + компонентами (`/catalog`, `/shop`, `/products/[slug]`).

### 3.2 Backend/CMS
- Конфиг: `src/payload.config.ts`.
- Core коллекции: `users`, `pages`, `categories`, `media`, `requests`, `contact-messages`.
- Через ecommerce plugin добавляются: `products`, `variants`, `variantTypes`, `variantOptions`, `carts`, `orders`, `transactions`, `addresses`.
- Globals: `home`, `header`, `footer`.
- Публичные endpoint’ы формы заявок:
  - `POST /api/requests/submit`
  - `POST /api/contact-messages/submit`

### 3.3 Данные и рендеринг
- Главная берется из global `home`.
- Универсальные CMS-страницы — из `pages` по `slug` через `/[slug]`.
- Товары — из `products` + связанные варианты/категории/медиа.

## 4. Структура директорий
```text
src/
  app/
    (app)/                # фронтенд-маршруты
    (payload)/            # admin + payload API routes
  access/                 # access control
  blocks/                 # layout blocks (config + component)
  collections/            # payload collections
  components/             # UI, бизнес-компоненты, admin-компоненты
  globals/                # home/header/footer
  hooks/                  # project hooks
  plugins/                # plugin composition
  providers/              # React providers
  utilities/              # утилиты
  payload.config.ts
scripts/                  # служебные миграции/инициализация контента
tests/                    # e2e + integration
docs/                     # актуальная проектная документация
```

## 5. Уже существующие страницы

## 5.1 Файловые route
- `/`
- `/catalog`
- `/shop`
- `/products/[slug]`
- `/checkout`
- `/checkout/confirm-order`
- `/login`
- `/create-account`
- `/forgot-password`
- `/logout`
- `/account`
- `/account/addresses`
- `/orders`
- `/orders/[id]`
- `/find-order`
- `/portfolio` (статический placeholder)
- `/goszakupki-44-fz-223-fz` (статический placeholder)
- `/servisnyy-centr` (статический placeholder)

## 5.2 CMS-страницы из `pages` (фактические записи в БД)
- `o-nas` (`/o-nas`)
- `servisnii-tsentr` (`/servisnii-tsentr`)
- `home` (legacy record, главная фактически из global `home`)
- `kontakty` (`/kontakty`)

## 5.3 Payload/admin/service routes
- `/admin`
- `/api/*` (Payload REST)
- `/api/graphql`
- `/api/graphql-playground`
- `/next/preview`
- `/next/exit-preview`
- `/next/seed`

## 6. Ключевые уже реализованные компоненты
- Хедер с меню, dropdown каталога, мобильным меню и overlay-поиском.
- Футер на основе global `footer` с CTA/контактами/навигацией.
- Каталог категорий (`/catalog`) с превью из категорий/товаров.
- Список товаров (`/shop`) с фильтрами, сортировкой, поиском, категоризацией.
- Карточка товара (`/products/[slug]`):
  - галерея,
  - выбор варианта,
  - добавление в заявку,
  - блоки описания и характеристик (таблица/группы),
  - breadcrumbs по категориям.
- Cart modal и checkout-форма заявки в `requests`.
- Контактная форма (`ContactsHub`) с отправкой в `contact-messages`.
- Личный кабинет пользователя: профиль, адреса, заказы, просмотр заказа.
- Кастомные длинные блоки контента: `AboutCompany`, `ServiceCenter`, `ContactsHub`, `HomeB2B`.
- Admin-кастомизации: `BeforeLogin`, `BeforeDashboard`, `SeedButton`, переключатель режима доп.описания товара.

## 7. Что еще осталось сделать (приоритетный список)
1. Синхронизировать устаревшие URL/редиректы:
   - `LoginForm`: ссылка на `/recover-password` при существующем `/forgot-password`.
   - `ConfirmOrder`: редирект на `/shop/order/:id` при существующем `/orders/[id]`.
   - В проекте есть legacy-ссылки/seed/test на `/search`, рабочий маршрут — `/shop`.
2. Убрать дублирование/рассинхрон сервиса:
   - CMS страница `servisnii-tsentr` и отдельный статический route `/servisnyy-centr`.
3. Привести footer-навигацию к актуальным контактным страницам (`/kontakty` vs `/goszakupki-44-fz-223-fz`).
4. Обновить `.env.example` (сейчас пример содержит MongoDB URL, а проект использует SQLite).
5. Переписать e2e-тесты под текущую IA и тексты интерфейса (тесты сейчас частично из template-сценария).
6. Решить вопрос с `sitemap.xml` (в `robots` указан, отдельного route-генератора нет).

## 8. Routes (реальные пути файлов)
Для всех публичных страниц используется общий layout `src/app/(app)/layout.tsx`: он подключает `Header` и `Footer`.
- `Header`: `global` `header` (`navItems`, `catalogCategories`) + `collection` `categories` (`title`, `parentCategory`, `dropdownImage`).
- `Footer`: `global` `footer` (`aboutDescription`, `contactPhone`, `contactEmail`, `primaryCTA`, `secondaryCTA`, `navItems`).

| URL | Реальный путь файла | Что делает | Откуда берёт данные (подтверждено кодом) |
| --- | --- | --- | --- |
| `/` | `src/app/(app)/page.tsx` (re-export `src/app/(app)/[slug]/page.tsx`) | Главная страница. | `global` `home` через `payload.findGlobal({ slug: 'home' })`; используются `hero`, `layout`, `meta`. |
| `/[slug]` | `src/app/(app)/[slug]/page.tsx` | Универсальный рендер CMS-страниц по slug. | `collection` `pages`: фильтр по `slug` и `_status=published` (в non-draft), используются `hero`, `layout`, `meta`, `slug`. |
| `/catalog` | `src/app/(app)/catalog/page.tsx` | Витрина категорий каталога с превью. | `collection` `categories` (`title`, `slug`, `catalogImage`) + `collection` `products` (`categories`, `gallery`, `meta`) для fallback-картинок. |
| `/shop` | `src/app/(app)/shop/page.tsx` (+ `src/app/(app)/shop/layout.tsx`) | Список товаров с фильтрами/поиском/сортировкой. | `categories.parentCategory` для дерева фильтра + `products` (`brand`, `model`, `title`, `slug`, `description`, `gallery`, `categories`, `priceInUSD`, `inventory`, `enableVariants`, `variants`) с фильтром по `_status`. |
| `/products/[slug]` | `src/app/(app)/products/[slug]/page.tsx` | Карточка товара, спецификации, related products. | `collection` `products` по `slug`, `depth: 2`; используются `title`, `slug`, `description`, `descriptionMode`, `descriptionHTML`, `extraDescription`, `gallery`, `meta`, `priceInUSD`, `inventory`, `enableVariants`, `categories`, `specifications`, `specificationsTitle`, `specificationsView`, `relatedProducts`, `layout`; `variants` пополняются полями `title`, `priceInUSD`, `inventory`, `options`. |
| `/checkout` | `src/app/(app)/checkout/page.tsx` | Экран отправки заявки. | Client-state (`useCart`, `useAuth`) + `POST /api/requests/submit` -> `collection` `requests` (`status`, `name`, `company`, `phone`, `email`, `comment`, `items`, `subtotal`, `customer`). |
| `/checkout/confirm-order` | `src/app/(app)/checkout/confirm-order/page.tsx` | Подтверждение оплаты/заказа после возврата от Stripe. | `UNCONFIRMED` для прямой коллекции: в route нет прямого `payload.find/create`; в client-компоненте используются `usePayments().confirmOrder('stripe')`, `useCart`, query params `payment_intent`, `email`. |
| `/login` | `src/app/(app)/login/page.tsx` | Логин пользователя. | Проверка сессии через `payload.auth({ headers })`; форма использует `/api/users/login` (`users` auth API). |
| `/create-account` | `src/app/(app)/create-account/page.tsx` | Регистрация пользователя. | Проверка сессии через `payload.auth`; форма создаёт пользователя через `/api/users` и логинит через `/api/users/login` (`users`). |
| `/forgot-password` | `src/app/(app)/forgot-password/page.tsx` | Восстановление пароля. | Форма отправляет `/api/users/forgot-password` (`users` auth API). |
| `/logout` | `src/app/(app)/logout/page.tsx` | Выход из учётной записи. | Client `useAuth.logout()` -> `/api/users/logout`. |
| `/account` | `src/app/(app)/(account)/account/page.tsx` | Настройки профиля + последние заказы. | `payload.auth` + `collection` `orders` (последние 5 по `customer = user.id`, `overrideAccess: false`); форма профиля обновляет `users` через `/api/users/:id`. |
| `/account/addresses` | `src/app/(app)/(account)/account/addresses/page.tsx` | Адреса пользователя (список/создание). | `payload.auth`; client `useAddresses` (ecommerce addresses API), плюс серверный запрос `orders` (как в `/account`). |
| `/orders` | `src/app/(app)/(account)/orders/page.tsx` | Список заказов пользователя. | `payload.auth` + `collection` `orders` по `customer = user.id`, `overrideAccess: false`. |
| `/orders/[id]` | `src/app/(app)/(account)/orders/[id]/page.tsx` | Детальная страница заказа (для пользователя или гостя по email). | `collection` `orders` с фильтрами по `id` + (`customer=user.id` или `customerEmail=email`); явно выбираются `amount`, `currency`, `items`, `customerEmail`, `customer`, `status`, `createdAt`, `updatedAt`, `shippingAddress`. |
| `/find-order` | `src/app/(app)/find-order/page.tsx` | Форма поиска заказа по email + ID. | `payload.auth` только для prefill email; форма ведёт на `/orders/[id]?email=...`, фактическое чтение заказа делает маршрут `/orders/[id]`. |
| `/portfolio` | `src/app/(app)/portfolio/page.tsx` | Статический placeholder раздела портфолио. | Прямых запросов к Payload нет. |
| `/goszakupki-44-fz-223-fz` | `src/app/(app)/goszakupki-44-fz-223-fz/page.tsx` | Статический placeholder раздела госзакупок. | Прямых запросов к Payload нет. |
| `/servisnyy-centr` | `src/app/(app)/servisnyy-centr/page.tsx` | Статический placeholder страницы сервисного центра. | Прямых запросов к Payload нет. |

## 9. Ключевые файлы проекта
- `src/app/(app)` — основной public App Router слой (страницы сайта, публичные API route handlers, preview/seed routes).
- `src/app/(payload)` — слой Payload admin/UI и автогенерируемых API endpoint’ов.
- `src/collections` — source of truth по кастомным коллекциям (`pages`, `categories`, `users`, `requests`, `contact-messages`, `media`, `products` override).
- `src/globals` — глобальные документы `home`, `header`, `footer`.
- `src/components` — UI/бизнес-компоненты для storefront и account-flow.
- `src/payload.config.ts` — центральная Payload-конфигурация (DB, collections, globals, plugins, editor, i18n).
- `src/plugins/index.ts` — подключение `seo`, `form-builder`, `ecommerce` и Stripe adapter.
- `src/app/(app)/layout.tsx` — общий layout публичного сайта (providers + `Header`/`Footer`/admin bar).
- `src/app/(app)/[slug]/page.tsx` — универсальный рендер CMS-страниц и главной через `home`.
- `src/app/(app)/catalog/page.tsx` — витрина категорий и логика fallback-превью из товаров.
- `src/app/(app)/shop/page.tsx` — каталог товаров с фильтрами/поиском.
- `src/app/(app)/products/[slug]/page.tsx` — карточка товара, SEO, характеристики, related products.
- `src/app/(app)/checkout/page.tsx` — checkout UI заявки (`requests` flow).
- `src/app/(app)/api/requests/submit/route.ts` — публичный endpoint отправки заявки в `requests` с валидацией.
- `src/app/(app)/api/contact-messages/submit/route.ts` — публичный endpoint контактов в `contact-messages` с валидацией.
- `src/app/(payload)/admin/[[...segments]]/page.tsx` — точка входа Payload admin в Next App Router.
- `src/app/(payload)/api/[...slug]/route.ts` — автогенерируемый REST роутер Payload (`/api/*`).
- `src/collections/Pages/index.ts` — схема `pages`, блоки, SEO-поля, slug/transliteration, revalidate hooks.
- `src/collections/Products/index.ts` — override ecommerce `products`: `brand+model->title`, `gallery`, характеристики, slug.
- `src/collections/Categories.ts` — схема `categories` (иерархия, изображения dropdown/catalog, slug).
- `src/collections/Requests.ts` — схема входящих заявок B2B (`requests`).
- `src/collections/ContactMessages/index.ts` — схема сообщений из контактной формы.
- `src/collections/Users/index.ts` — auth-коллекция пользователей и access-правила.
- `src/globals/Home.ts` — schema global `home` (hero/layout/meta) для главной страницы.
- `src/globals/Header.ts` — schema global `header` (навигация + выбранные категории каталога).
- `src/globals/Footer.ts` — schema global `footer` (CTA, контакты, навигация).
- `src/lib/catalog-categories.ts` — нормализация и пресеты категорий для header/shop/catalog.
- `src/utilities/slugifyRussian.ts` — единая транслитерация slug для русскоязычных названий.
- `next.config.js` — Next-конфиг, интеграция `withPayload`, redirects, image remote patterns, webpack cache policy.
- `package.json` — зависимости и рабочие команды (`dev`, `build`, `generate:types`, `generate:importmap`, `migrate:*`, тесты).
