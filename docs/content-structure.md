# Content Structure

Снимок структуры собран по текущему Payload-конфигу, блокам и фактической SQLite-схеме.

## 0. Сводная карта секций сайта (по коду фронта и Payload-конфигу)

| Секция сайта | Источник в Payload (global/collection/field/block) | Компонент(ы) фронта (пути файлов) | Маршрут(ы) | Примечание |
| --- | --- | --- | --- | --- |
| Header (навигация, CTA, лого) | `global.header.navItems[]`, `global.header.catalogCategories[]`; `collection.categories.{title,parentCategory,dropdownImage}`; CTA/лого: `UNCONFIRMED` (в `global.header` нет отдельных полей под CTA и logo) | `src/app/(app)/layout.tsx`; `src/components/Header/index.tsx`; `src/components/Header/index.client.tsx`; `src/components/Header/MobileMenu.tsx`; `src/lib/catalog-categories.ts` | `/*` (через `src/app/(app)/layout.tsx`) | Кнопка `Каталог` и лого `/blacklogo.svg` захардкожены во фронте. |
| Footer (контакты/ссылки) | `global.footer.{aboutDescription,contactPhone,contactEmail,primaryCTA,secondaryCTA,navItems[]}` | `src/app/(app)/layout.tsx`; `src/components/Footer/index.tsx`; `src/components/Footer/menu.tsx` | `/*` (через `src/app/(app)/layout.tsx`) | Есть fallback-меню во фронте; дефолты в `global.footer` и в компоненте частично расходятся по URL контактов. |
| Главная: Hero + ключевые секции | `global.home.hero.{type,richText,links,media}` + `global.home.layout[]` (блоки: `aboutCompany`, `serviceCenter`, `contactsHub`, `homeB2B`, `content`, `mediaBlock`, `cta`, `archive`, `carousel`, `threeItemGrid`, `banner`, `formBlock`) | `src/app/(app)/page.tsx`; `src/app/(app)/[slug]/page.tsx`; `src/heros/RenderHero.tsx`; `src/heros/HighImpact/index.tsx`; `src/heros/MediumImpact/index.tsx`; `src/heros/LowImpact/index.tsx`; `src/blocks/RenderBlocks.tsx` | `/` | Фактический набор секций определяется содержимым `home.layout` в админке. |
| About | `collection.pages` (документ со `slug='o-nas'`, поле `layout[]` с block `aboutCompany` и его полями `hero/facts/sections/partners/final`) | `src/app/(app)/[slug]/page.tsx`; `src/blocks/RenderBlocks.tsx`; `src/blocks/AboutCompany/Component.tsx` | `/o-nas` | В `src/app/(app)/[slug]/page.tsx` hero страницы скрывается для `o-nas`; используется hero внутри блока `aboutCompany`. |
| Service Center | `collection.pages` (документ со `slug='servisnii-tsentr'`, block `serviceCenter` с полями `hero/cards/sections/serviceRequest/final`) | `src/app/(app)/[slug]/page.tsx`; `src/blocks/RenderBlocks.tsx`; `src/blocks/ServiceCenter/Component.tsx`; `src/app/(app)/servisnyy-centr/page.tsx` | `/servisnii-tsentr`; `/servisnyy-centr` | Есть рассинхрон slug: CMS-страница и отдельный статический route с другой транслитерацией. |
| Contacts | `collection.pages` (документ со `slug='kontakty'`, block `contactsHub` с полями `hero/heroContacts/directions/mainContacts/requisites/form/final`); запись сообщений в `collection.contact-messages` | `src/app/(app)/[slug]/page.tsx`; `src/blocks/RenderBlocks.tsx`; `src/blocks/ContactsHub/Component.tsx`; `src/blocks/ContactsHub/Form.client.tsx` | `/kontakty`; `POST /api/contact-messages/submit` | Форма контактов в блоке `contactsHub` отправляет данные в отдельный публичный endpoint. |
| Catalog / Categories | `collection.categories.{title,slug,parentCategory,catalogImage,dropdownImage}`; дополнительно `collection.products.{categories,gallery,meta.image}` для fallback-превью | `src/app/(app)/catalog/page.tsx`; `src/lib/catalog-categories.ts` | `/catalog`; ссылки в `/shop?category=:id` | Категории для витрины нормализуются через `buildCatalogCategoryViews` (preset-логика). |
| Shop / Products list | `collection.products.{brand,model,title,slug,description,gallery,categories,priceInUSD,variants,inventory,enableVariants,_status}`; `collection.categories.parentCategory` для фильтра с дочерними категориями | `src/app/(app)/shop/layout.tsx`; `src/components/layout/search/Categories.tsx`; `src/components/layout/search/Categories.client.tsx`; `src/app/(app)/shop/page.tsx`; `src/components/ProductGridItem/index.tsx` | `/shop`; `/shop?category=:id`; `/shop?q=...` | Поиск и фильтры работают по query params; есть legacy-упоминания `/search` в проекте. |
| Product page (деталка) | `collection.products.{slug,title,description,extraDescription,descriptionHTML,descriptionMode,gallery,priceInUSD,variants,inventory,relatedProducts,categories,specificationsTitle,specificationsView,specifications[],layout,meta.*}` + связанные `categories` | `src/app/(app)/products/[slug]/page.tsx`; `src/components/product/ProductDescription.tsx`; `src/components/product/Gallery.tsx`; `src/blocks/RenderBlocks.tsx` | `/products/[slug]` | Характеристики рендерятся как grouped/table; breadcrumb строится из `products.categories`. |
| Forms / request flows | `collection.requests.{name,company,phone,email,comment,items[],subtotal,status,customer}`; `collection.contact-messages.{name,company,phone,email,message,sourcePage}`; `block.formBlock.form -> collection.forms` (`UNCONFIRMED`: использование в опубликованных страницах не проверялось) | `src/app/(app)/checkout/page.tsx`; `src/components/checkout/CheckoutPage.tsx`; `src/blocks/ContactsHub/Form.client.tsx`; `src/blocks/Form/Component.tsx` | `/checkout`; `/kontakty`; `POST /api/requests/submit`; `POST /api/contact-messages/submit`; `/api/form-submissions` | `CheckoutPage` и `ContactsHubForm` подтверждены напрямую; `formBlock` подтвержден по схеме и клиентскому submit, но не по фактическому опубликованному контенту. |

## 0.1 Публичные endpoints записи/заявок (файлы handlers)

| Endpoint | Файл handler | Вызов с фронта | Записывает в Payload | Примечание |
| --- | --- | --- | --- | --- |
| `POST /api/requests/submit` | `src/app/(app)/api/requests/submit/route.ts` | `src/components/checkout/CheckoutPage.tsx` | `requests` | Валидирует контакт + `items`, создает запись заявки. |
| `POST /api/contact-messages/submit` | `src/app/(app)/api/contact-messages/submit/route.ts` | `src/blocks/ContactsHub/Form.client.tsx` | `contact-messages` | Валидирует контакт + сообщение, создает запись сообщения (`overrideAccess: true`). |
| `POST /api/form-submissions` | `src/app/(payload)/api/[...slug]/route.ts` | `src/blocks/Form/Component.tsx` | `form-submissions` (plugin form-builder) | `UNCONFIRMED`: обрабатывается общим REST-роутером Payload, но фактическое использование `formBlock` в опубликованных страницах в этом проходе не проверялось. |

## 1. Что редактируется из админки

## 1.1 Core collections

## `users`
- Назначение: аутентификация и роли (`admin`, `customer`).
- Важные поля: `name`, `email`, `roles`.
- Связанные join-поля: `orders`, `cart`, `addresses`.
- Доступ: admin или владелец документа (`adminOrSelf`), роли доступны на запись/чтение только админам.

## `pages`
- Назначение: CMS-страницы по slug.
- Важные поля: `title`, `slug`, `hero`, `layout (blocks)`, `meta`, `_status`.
- Доступ: чтение `adminOrPublishedStatus`, запись только admin.
- Есть версии/drafts.

## `categories`
- Назначение: таксономия каталога (иерархия parent/child).
- Важные поля: `title`, `slug`, `parentCategory`, `dropdownImage`, `catalogImage`.
- Чтение публичное.

## `media`
- Назначение: изображения/медиа для страниц/товаров/категорий.
- Важные поля: `alt`, `caption`, upload file.
- Хуки:
  - авто-генерация `alt` из имени файла,
  - нормализация изображения до `1200x1200`.

## `requests`
- Назначение: входящие коммерческие заявки с товаров.
- Поля: контактные данные + `items[]` (product, variant, quantity, price) + `subtotal`, `status`.
- CRUD в админке: только admin.

## `contact-messages`
- Назначение: сообщения из формы контактов.
- Поля: `name`, `company`, `phone`, `email`, `message`, `sourcePage`.
- CRUD в админке: только admin.

## 1.2 Collections, добавленные ecommerce plugin
- `products`
- `variants`
- `variantTypes`
- `variantOptions`
- `carts`
- `orders`
- `transactions`
- `addresses`

## `products` (переопределенная коллекция)
- Ключевые поля:
  - `brand`, `model`, `title` (title собирается автоматически),
  - `description` + `extraDescription` (visual mode) + `descriptionHTML` (html mode),
  - `gallery` (`upload hasMany`),
  - `layout` (блоки `cta/content/mediaBlock`),
  - `relatedProducts`, `categories`,
  - `specificationsTitle`, `specificationsView`, `specificationsBulkPaste`, `specifications[]`.
- Ключевая бизнес-логика:
  - авто-парсинг bulk-таблицы характеристик,
  - авто-классификация характеристик по секциям,
  - дедупликация gallery,
  - локализация ценового поля в админке под рубли (UI-слой).

## 1.3 Globals

## `home`
- Главная страница как global document.
- Содержит `hero`, `layout (blocks)`, `meta`.

## `header`
- Пункты меню (`navItems`) и ручной список категорий для dropdown (`catalogCategories`).

## `footer`
- Описание компании, контакты, CTA-кнопки, навигация.

## 2. Доступные блоки контента
`pages` и `home` используют общий набор block types:
- `aboutCompany`
- `serviceCenter`
- `contactsHub`
- `homeB2B`
- `content`
- `mediaBlock`
- `cta`
- `archive`
- `carousel`
- `threeItemGrid`
- `banner`
- `formBlock`

`products.layout` поддерживает:
- `cta`
- `content`
- `mediaBlock`

## 3. Публичные endpoint’ы записи данных

## `POST /api/requests/submit`
- Принимает контакт + товары из cart.
- Валидирует: наличие телефона/email, корректность email, непустые items.
- Создает документ в `requests`.

## `POST /api/contact-messages/submit`
- Принимает форму контактов.
- Валидирует: телефон/email, корректность email, минимальная длина сообщения.
- Создает документ в `contact-messages`.

Примечание: в `POST /api/contact-messages/submit` используется `overrideAccess: true` для публичной отправки; `POST /api/requests/submit` создает заявку без явного `overrideAccess`.

## 4. Текущий контент-снимок (БД)

## 4.1 Страницы `pages`
- `o-nas` (published)
- `servisnii-tsentr` (published)
- `home` (published, legacy-страница)
- `kontakty` (published)

## 4.2 Home global layout
- Сейчас присутствуют блоки: `content`, `carousel`, `homeB2B`.

## 4.3 Pages layout по факту
- `o-nas` -> `aboutCompany`
- `servisnii-tsentr` -> `serviceCenter`
- `kontakty` -> `contactsHub`
- `home` (page) -> `content`, `carousel` (legacy route-контент)

## 4.4 Категории
- Есть верхнеуровневые и дочерние категории (например, дочерние для «Вращающиеся головы»).
- Header dropdown строится от `buildCatalogCategoryViews` с fallback на все категории, если `header.catalogCategories` не заполнен.

## 5. Структурные инварианты (нельзя ломать)
1. `home` global — основной источник контента для `/`.
2. Для products не возвращаться к старой схеме gallery через отдельную таблицу — используется `upload hasMany`.
3. Не менять slug/blockType ключи без миграции данных и регенерации типов.
4. При изменении модели контента обязательно:
   - `generate:types`
   - `generate:importmap` (если менялись admin-компоненты/пути)
   - проверка `check:types`.
5. Access-функции и ограничения по ролям (`admin`/`customer`) должны оставаться согласованными с коллекциями.
