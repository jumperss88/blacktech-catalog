---
name: blacktech-payload-schema-change
description: Узкий skill для безопасных изменений schema/data-contract в Payload с обязательной регенерацией типов и проверками.
---

## Responsibility
1. Только schema/data-contract: `collections`, `globals`, schema-конфиги блоков, `access`, `hooks`, `payload.config`, миграции.
2. Без feature-разработки UI, роутов и несвязанных компонентов.
3. Обязательные инварианты безопасности и целостности брать из `AGENTS.md` (разделы 3, 4, 5, 10).

## When to use
1. Добавляются/удаляются/переименовываются поля в `src/collections/**`.
2. Меняются глобалы `src/globals/Home.ts`, `Header.ts`, `Footer.ts`.
3. Меняются schema-конфиги блоков, используемые в `pages/home/products`.
4. Меняются `access`-правила коллекций или логика `hooks`.
5. Меняются admin-компоненты/пути компонентов в полях Payload.
6. Меняется `src/payload.config.ts` или подключение плагинов, влияющее на схему.
7. Нужна миграция структуры БД и проверка статуса миграций.
8. Нужна синхронизация schema-контракта в документации после изменения модели.

## When NOT to use
1. Нужны только стили/верстка без изменения схемы Payload.
2. Нужны только правки контента в админке без изменения кода схемы.
3. Нужны изменения только в роутах/API/UI без schema-изменений.
4. Нужны только e2e/integration проверки без изменения модели данных.
5. Требуется ручное редактирование автогенерируемых файлов в `src/app/(payload)/**`.
6. Задача предполагает ослабление access-контроля для `users`, `requests`, `contact-messages`, `pages`.

## Allowed changes
1. `src/collections/**`
2. `src/globals/**`
3. `src/blocks/**/config.ts` (только schema/config блоков)
4. `src/access/**`
5. `src/hooks/**`
6. `src/payload.config.ts`
7. `src/plugins/**` (только части, влияющие на Payload schema)
8. `src/migrations/**`
9. `docs/project-spec.md`
10. `docs/content-structure.md`
11. `docs/ops-runbook.md` (только если изменились процедуры миграции/проверок)
12. Автогенерируемые артефакты только через команды `generate:types` и `generate:importmap`.

## Forbidden changes
1. Любые файлы вне `Allowed changes`, включая `src/app/**`, `src/components/**`, `tests/**`, `.env*`.
2. Ручное редактирование файлов в `src/app/(payload)/**`.
3. Нарушение инварианта Local API: при вызове с `user` обязателен `overrideAccess: false`.
4. Nested-операции в hooks без передачи `req`.
5. Hook-операции без `context`-флагов защиты от рекурсии.
6. Ослабление access для `users`, `requests`, `contact-messages`, `pages`.
7. Изменение `/api/requests/submit` и `/api/contact-messages/submit` без явной валидации входа.
8. Прямые правки `blacktech-catalog.db`.
9. "Лезть в чужие файлы": задачи page-block/docs-only/release-check выполнять отдельными skill.

## Commands
1. `corepack pnpm run generate:types`
2. `corepack pnpm run generate:importmap` (если изменялись admin-компоненты/пути компонентов)
3. `corepack pnpm run check:types`
4. `corepack pnpm run migrate:status` (если затронута структура БД)
5. `corepack pnpm run migrate`:
   - если script существует и запуск не запрошен: `NOT RUN (reason: requires explicit request)`
   - `NOT PRESENT` только если script отсутствует в `package.json`

## Workflow
1. Preflight: подтвердить, что задача относится к schema/data-contract и файлы попадают в allowlist.
2. Внести schema/access/hook/plugin/migration изменения.
3. Проверить обязательные инварианты из `AGENTS.md` (раздел 3) для `overrideAccess`, `req`, `context`, access-control и submit validation.
4. Выполнить команды из раздела `Commands` по факту изменений.
5. Для статусов команд использовать только:
   - `NOT PRESENT` — script отсутствует в `package.json`
   - `NOT RUN` — script есть, но не запускался (причина обязательна)
   - `NOT APPLICABLE` — команда не относится к задаче
   - `PASS` / `FAIL` — команда запускалась
6. Обновить `docs/project-spec.md` и `docs/content-structure.md` (и `docs/ops-runbook.md` при изменении процедур).
7. Если влияние schema-change на публичные routes/API не подтверждено кодом, пометить как `UNCONFIRMED`.
8. Rollback-процедуру указывать как `NOT APPLICABLE`, если задача явно ее не задает.
9. Перед завершением убедиться, что не изменены чужие файлы.

## UNCONFIRMED
1. Ставить `UNCONFIRMED`, когда утверждение не подтверждено кодом/конфигом/фактическим выводом команды.
2. Нельзя объявлять `CONFIRMED` на основе предположений, старых тредов, устаревшего `README.md` или памяти.
3. Для `API/route impact` использовать `CONFIRMED` только при прямом подтверждении в измененном коде или маршрутизации.
4. Для статусов команд `UNCONFIRMED` не используется: применять только словарь статусов команд.

## Output format (mandatory)
1. `Schema scope:` `collections | globals | block schema | access | hooks | payload config | migrations`
2. `Files changed:` список измененных файлов
3. `Commands run:` для каждой команды статус `NOT PRESENT | NOT RUN | NOT APPLICABLE | PASS | FAIL` и причина (для `NOT RUN` причина обязательна)
4. `Invariants check:` статус обязательных правил из `AGENTS.md`
5. `Docs updated:` какие docs синхронизированы
6. `API/route impact:` `CONFIRMED` или `UNCONFIRMED`
7. `Rollback:` `NOT APPLICABLE | NOT RUN | PASS | FAIL` (+ план, если запрошен)
8. `Out-of-scope requests:` что отклонено как "чужие файлы" (или `none`)

## Example tasks
1. Добавить поле `phone` в `requests` и обновить типы.
2. Переименовать поле в `pages` или `home` и синхронизировать docs.
3. Усилить `access` для `contact-messages` без нарушения инвариантов.
4. Добавить hook с nested-операцией и корректной передачей `req/context`.
5. Изменить схему `products.specifications` с проверкой инвариантов.
6. Добавить admin component path для поля и запустить `generate:importmap`.
7. Изменить plugin-конфиг, влияющий на Payload schema.
8. Подготовить и верифицировать миграцию структуры БД (`migrate:status`, далее по задаче `migrate`).
## Patch Overrides (priority)

Этот блок имеет приоритет над любыми конфликтующими формулировками ниже в файле.

### Commands status standard
- `NOT PRESENT` = script отсутствует в `package.json`.
- `NOT RUN` = script существует, но не запускался (с обязательной причиной, например: `requires explicit request`).
- `NOT APPLICABLE` = команда не относится к текущей задаче.
- `PASS` = script запускался и завершился успешно.
- `FAIL` = script запускался и завершился с ошибкой.

### Commands / Workflow normalization
- Не использовать `NOT PRESENT` как дефолтный статус для всех команд.
- Для `migrate` и любых других команд со script в `package.json`, которые не запускались в рамках task scope, использовать: `NOT RUN (requires explicit request)`.
- `NOT PRESENT` использовать только после проверки, что script реально отсутствует в `package.json`.

### Output format (mandatory)
- В отчете каждая релевантная команда должна иметь один из статусов: `NOT PRESENT`, `NOT RUN`, `NOT APPLICABLE`, `PASS`, `FAIL`.
- Запрещено помечать команды `NOT PRESENT` без подтверждения отсутствия script.
- Причина обязательна для `NOT RUN`.

### Submit endpoints scope
- Submit endpoints (`src/app/**/route.ts`) вне scope этого skill. Любые изменения handlers — отдельная задача/skill.

### src/plugins scope boundary
- В `src/plugins/**` разрешены только изменения, влияющие на Payload schema/admin config; не менять runtime/business logic и поведение storefront/checkout.

### Generated files policy
- Generated files: never edit manually; only via generate scripts.
## Status Reporting Standard (Mandatory Override)

This section is normative and has priority over all other sections in this file.
If any older wording below conflicts with this section, follow this section.

### Allowed statuses (use only these)

- `NOT PRESENT` = script is absent in `package.json`.
- `NOT RUN` = script exists, but was not executed; always include a short reason.
- `NOT APPLICABLE` = not relevant to the current task.
- `PASS` = script was executed and passed.
- `FAIL` = script was executed and failed.

Do not use any other status labels or synonyms.

### Migrate status rule (no ambiguity)

- Never mark migrate as `NOT PRESENT` by default.
- If a migrate script exists and was not explicitly requested to run, default status is `NOT RUN` with reason `requires explicit request`.
- Use `NOT PRESENT` for migrate only when the corresponding migrate script is actually missing from `package.json`.

### Output format requirement (mandatory for every command report)

Each reported command must include exactly one status from the allowed list above.
Use this structure consistently in all output blocks:

```text
- <command>: <STATUS> [reason: ...]
```

Rules:
- `reason` is required for `NOT RUN`.
- `reason` is optional for `NOT APPLICABLE`.
- `reason` is not required for `PASS`/`FAIL` unless extra context is needed.
