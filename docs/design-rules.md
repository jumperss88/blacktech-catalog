# Design Rules

Правила ниже фиксируют текущую визуальную систему проекта и обязательны при дальнейшей разработке.

## 1. Базовая визуальная система
- Основной стиль: светлый интерфейс с нейтральной палитрой + акцент `--site-accent`.
- Токены темы определены в `src/app/(app)/globals.css` (`--background`, `--foreground`, `--border`, `--site-accent`, и т.д.).
- Поддерживается `light`/`dark`, но дизайн приоритетно отстроен под светлую тему.

## 2. Типографика
- Базовые шрифты: Geist Sans / Geist Mono + Manrope (`--font-manrope`).
- Для товарных зон (цены, заголовки) уже настроены отдельные CSS-классы (`.product-detail-price`, `.product-card-title`, `.price-format`).
- Не вводить случайные сторонние шрифты локально в компонентах: использовать текущие CSS-переменные.

## 3. Сетка, ритм, адаптив
- Контент строится через `.container` и breakpoints из глобальных CSS/tailwind config.
- Ключевые брейкпоинты: `sm 40rem`, `md 48rem`, `lg 64rem`, `xl 80rem`, `2xl 86rem`.
- В каталоге и карточках уже настроены адаптивные состояния; новые компоненты должны подчиняться текущей сетке, а не создавать отдельную систему отступов.

## 4. Ключевые UI-паттерны
- Header:
  - sticky top bar,
  - desktop dropdown каталога,
  - mobile sheet-меню,
  - inline search overlay.
- Каталог (`/shop`):
  - карточки с большим медиа-блоком,
  - бренд/модель/цена,
  - icon-only add-to-cart в гриде,
  - sticky sidebar фильтров на desktop.
- Товар (`/products/[slug]`):
  - крупная галерея + thumbnail carousel,
  - селектор вариантов,
  - индикатор наличия,
  - таблица/группы характеристик,
  - breadcrumbs по категориям.
- Контентные long-form блоки (`about`, `service`, `contacts`, `homeB2B`) стилизованы как отдельный визуальный язык проекта и не должны упрощаться до шаблонного “обычного лендинга”.

## 5. UX и доступность
- Состояния интерактивных элементов: hover/focus/disabled должны оставаться явными.
- `focus-visible` контуры и ring-стили уже централизованы в `globals.css`; не удалять.
- Формы контактов/заявок должны сохранять серверную и клиентскую валидацию.

## 6. Что нельзя нарушать
1. Нельзя ломать текущую систему CSS-переменных темы и цветовых токенов.
2. Нельзя удалять/переопределять классы продуктовой типографики без полного визуального регресса всех товарных страниц.
3. Нельзя заменять long-form блоки (`AboutCompany`, `ServiceCenter`, `ContactsHub`, `HomeB2B`) на generic шаблонные секции.
4. Нельзя разносить одну и ту же сущность по разным визуальным паттернам без причины (например, несколько разных карточек товара для одной зоны каталога).
5. Нельзя вводить новые route-специфичные стили, дублирующие существующие глобальные паттерны, если это можно решить через текущие utilities/tokens.

## 7. Перед merge UI-изменений
- Проверить desktop + mobile на страницах: `/`, `/catalog`, `/shop`, `/products/[slug]`, `/checkout`.
- Проверить работу header dropdown/menu/search и cart modal.
- Проверить контрастность и читаемость ключевых текстов в light и dark.

## 8. Источники и токены
- Шрифты (источники):
  - `src/app/(app)/layout.tsx`: подключаются `GeistSans`, `GeistMono` и локальный `Manrope` (`variable: --font-manrope`), переменные шрифтов прокидываются в `<html className="...">`.
  - `src/app/(app)/globals.css`: `@theme` задаёт `--font-sans: var(--font-geist-sans)` и `--font-mono: var(--font-geist-mono)`; там же есть алиасы (`--font-montserrat`, `--font-rubik`, `--font-pt-sans` и др.) на `var(--font-sans)`.
  - `tailwind.config.mjs`: `fontFamily.sans` и `fontFamily.mono` маппятся на `var(--font-geist-sans)` / `var(--font-geist-mono)`.
- Шрифты (классы/переменные, которые реально используются):
  - Tailwind-классы: `font-sans`, `font-mono`.
  - CSS-переменные: `--font-geist-sans`, `--font-geist-mono`, `--font-manrope`.
  - Прикладные типографические классы: `.product-detail-price`, `.product-detail-title`, `.product-card-title`, `.price-format`.
- Цвета (источники):
  - `src/app/(app)/globals.css` (`:root` и `[data-theme='dark']`) — базовые CSS-переменные палитры.
  - `tailwind.config.mjs` (`theme.extend.colors`) — семантические цвета Tailwind, завязанные на CSS-переменные.
  - `src/app/(app)/globals.css` (`@theme inline`) — маппинг `--color-*` токенов на базовые переменные.
- Ключевые цветовые токены:
  - Базовые: `--background`, `--foreground`, `--border`, `--input`, `--ring`.
  - Surface/content: `--card`, `--card-foreground`, `--popover`, `--popover-foreground`.
  - Semantic: `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`.
  - Статусы: `--success`, `--warning`, `--error`.
  - Проектный акцент: `--site-accent`, `--site-accent-hover`, `--site-accent-tint`.
- Базовые размеры (по фактическому использованию классов в `src/`):
  - Типовые `text-*`: `text-sm`, `text-xs`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl` (+ локально `text-[0.95rem]`, `text-[2rem]`, `md:text-[2.15rem]`, `text-[11px]`).
  - Типовые `leading-*`: `leading-tight`, `leading-none` (реже: `leading-snug`, `leading-relaxed`).
  - Типовые spacing: `gap-2`, `gap-4`, `gap-6`, `gap-8`; `px-2`, `px-3`, `px-4`, `px-6`; `py-1`, `py-2`, `py-4`, `py-12`; `p-4`, `p-8`; `mb-2`, `mb-4`, `mb-6`, `mb-8`.
  - Container widths:
    - `.container` в `globals.css`: `max-width` по `--breakpoint-sm/md/lg/xl/2xl` + `padding-inline: 1rem` (с `md` — `2rem`).
    - Используемые локальные ограничения: `max-w-lg`, `max-w-xl`, `max-w-md`, `lg:max-w-3xl`.
- Брейкпоинты (подтверждено в `tailwind.config.mjs` и продублировано в `globals.css`):
  - `sm: 40rem`, `md: 48rem`, `lg: 64rem`, `xl: 80rem`, `2xl: 86rem`.

## 9. Эталонные компоненты/секции
- `src/components/Header/index.client.tsx` + `src/components/Header/index.css` — эталон шапки: sticky-навигация, desktop dropdown каталога, mobile sheet и search overlay в одном паттерне.
- `src/app/(app)/shop/page.tsx` — эталон адаптивной сетки каталога (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) и состояний списка.
- `src/components/ProductGridItem/index.tsx` — эталон карточки товара (медиа, бренд/модель, цена, icon-only CTA) в связке с глобальными `product-shop-card*` стилями.
- `src/app/(app)/products/[slug]/page.tsx` — эталон страницы товара: breadcrumbs, 2-колоночная композиция на `lg`, блоки описания/характеристик.
- `src/components/product/ProductDescription.tsx` — эталон типографики товарной зоны (заголовок/цена/сток/кнопки) и поведенческих ссылок на секции.
- `src/components/ui/button.tsx` — эталон базовых CTA-вариантов/размеров и `focus-visible`/`aria-invalid` состояний.
- `src/components/Footer/index.tsx` — эталон нижней зоны: токенизированные цвета, адаптивная сетка и типовая иерархия текста.
- `src/blocks/AboutCompany/Component.tsx` — эталон long-form секции «О компании» с отдельным class-family `about-*`.
- `src/blocks/ServiceCenter/Component.tsx` — эталон long-form секции сервиса с отдельным class-family `service-*`.
- `src/blocks/ContactsHub/Component.tsx` — эталон long-form секции контактов/формы с отдельным class-family `contacts-*`.

## 10. DO / DON'T
- DO: использовать `.container` и подтверждённые брейкпоинты `sm/md/lg/xl/2xl` из текущей темы.
- DO: использовать семантические токены (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`) вместо произвольной палитры.
- DO: для шрифтов опираться на `font-sans`/`font-mono` и переменные `--font-geist-*`, `--font-manrope`.
- DO: в товарных зонах переиспользовать существующие классы (`.product-detail-title`, `.product-detail-price`, `.product-card-title`, `.price-format`).
- DO: для интерактивных элементов опираться на `src/components/ui/*`, чтобы сохранить единые `focus-visible` и `aria-invalid` состояния.
- DO: для long-form страниц использовать существующие семейства классов `about-*`, `service-*`, `contacts-*`, `home-b2b-*`.
- DON'T: не менять локально контейнерные ширины/паддинги, если задача решается текущим `.container` и стандартными utility-классами.
- DON'T: не вводить новые route-specific стили, дублирующие уже существующие паттерны в `globals.css`.
- DON'T: не убирать hover/focus/disabled состояния у кнопок, ссылок и полей ввода.
- DON'T: не подменять long-form секции (`AboutCompany`, `ServiceCenter`, `ContactsHub`, `HomeB2B`) generic-шаблоном.
