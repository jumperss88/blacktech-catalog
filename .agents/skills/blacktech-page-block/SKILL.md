# blacktech-page-block

Узкий skill для разработки и изменения block-layer (`home/pages/products`) без выхода в чужие зоны проекта.

## Purpose
- Реализовывать и дорабатывать блоки контента и их UI-представление в рамках существующего block-layer.
- Не затрагивать маршрутизацию, API, доступы, миграции и иные зоны вне block-layer.

## Strict Scope (Single Source of Truth)
This section overrides any conflicting text in this file.

### Allowed
- `src/blocks/**`
- `src/components/**` только если изменение напрямую обслуживает рендеринг/поведение блоков.
- `src/globals/**` только в части, связанной с block-layout (без изменения access-политик и API-контрактов).
- `src/collections/**` только для wiring существующих блоков в уже используемые layout-поля (без изменения security/access-логики).
- `docs/content-structure.md` при изменении структуры/состава блоков.
- `docs/design-rules.md` опционально, только если фактически изменены UI-правила или визуальные токены.

### Forbidden
- `docs/project-spec.md`.
- Любые иные `docs/*`, кроме явно разрешенных в секции Allowed.
- `src/app/**` (routes, pages, handlers) и любые route-level правки.
- `src/app/(payload)/**` (автогенерируемые области).
- `src/access/**`, `src/hooks/**`, `src/utilities/**` вне прямой block-задачи.
- `src/migrations/**`, `scripts/**`, `blacktech-catalog.db`, любые операции с БД.
- `.env*`, `package.json`, lockfiles, CI/CD-конфиги и release-конвейер.
- Любые изменения access-контроля коллекций `users`, `requests`, `contact-messages`, `pages`.
- Любые публичные write-endpoints и их контракты валидации.

## Allowed
Alias-section для QA: использовать только список из `Strict Scope (Single Source of Truth)` -> `Allowed`.
При конфликте источником истины остается `Strict Scope (Single Source of Truth)`.

## Forbidden
Alias-section для QA: использовать только список из `Strict Scope (Single Source of Truth)` -> `Forbidden`.
При конфликте источником истины остается `Strict Scope (Single Source of Truth)`.

## Context Order
- Сначала читать `docs/ops-runbook.md`.
- Затем профильные документы задачи: `docs/content-structure.md` и при необходимости `docs/design-rules.md`.

## Workflow
- Проверять факты по текущему коду, а не по старым обсуждениям.
- Держать изменения локальными и минимальными в пределах block-layer.
- Если запрос выходит за scope, остановиться и явно отметить, что требуется другой skill/отдельное согласование.
- Для любых вопросов про разрешенные/запрещенные зоны использовать только секцию `Strict Scope (Single Source of Truth)`.

## Safety
- Не ослаблять существующие security/access-инварианты.
- Не вносить schema- или API-contract изменения под видом block-правок.
- Не выполнять миграции и не править данные напрямую.
## When to use
1. Добавить новый block в `src/blocks/**`: определить schema полей, labels и defaults, не выходя за block-layer.
2. Подключить renderer для существующего block (React-компонент + типобезопасный props mapping) без изменения routes/API.
3. Сделать wiring блока в layout-builder (регистрация блока в конфиге коллекции/глобала и соответствие `blockType` -> renderer).
4. Изменить field mapping внутри блока (например, upload/relation/richText -> UI) с сохранением текущего data-contract блока.
5. Удалить/депрекейтнуть block и обновить его wiring/renderer так, чтобы страницы продолжали корректно рендериться.
6. Обновить mapping-строку в `docs/content-structure.md` для добавленного/измененного блока после подтвержденных кодом изменений.
7. Нормализовать блок до общего паттерна проекта (schema + renderer + wiring) без правок checkout/auth/orders/API.

## When NOT to use
1. Любые задачи checkout/payments/cart/orders (включая Stripe, ConfirmOrder, order flows).
2. Любые задачи auth/users/sessions/password reset/login routes.
3. Любые публичные/внутренние API endpoint изменения (`/api/**`, submit routes, handlers, contracts).
4. Изменения access-control, hooks, бизнес-логики коллекций/глобалов вне block rendering.
5. Миграции, изменение DB schema, операции с данными, seed/backfill/manual DB updates.
6. Добавление/изменение App Router routes, redirects, middleware и route handlers.
7. Изменения ecommerce plugin, pricing/order calculations, webhook processing.
8. Любые работы, где основной scope не block-layer (schema блока + renderer + wiring + mapping docs).

## Output format
Используй строго этот шаблон отчета без дополнительных секций.
Допустимые статусы проверок только в формате: `NOT PRESENT | NOT RUN | NOT APPLICABLE | PASS | FAIL`.
Для статуса `NOT RUN` причина обязательна в том же пункте.

```md
Files changed
- <path>

Commands
- <command or check name> — <NOT PRESENT | NOT RUN | NOT APPLICABLE | PASS | FAIL>; reason: <обязательно при NOT RUN, иначе n/a>

Out-of-scope requests
- <none | что именно вне scope и какой skill/согласование требуется>

Mapping updated? (content-structure row yes/no)
- <yes|no>: <короткое обоснование>

UNCONFIRMED
- <none | факт, не подтвержденный кодом или актуальными docs>
```

## UNCONFIRMED
1. Любое утверждение, не подтвержденное кодом или актуальными docs, обязательно маркировать как `UNCONFIRMED`.
2. Формулировки предположений (`скорее всего`, `вероятно`, `можно предположить`) без метки `UNCONFIRMED` запрещены.
3. Если критичный для правки факт не подтвержден (например, точные пути wiring блока), остановиться и запросить уточнение у пользователя до внесения правок.
