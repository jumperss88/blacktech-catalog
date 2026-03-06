# Skills review

## blacktech-docs-guard
- Critical:
1. `When to use` п.8 (закрытие backlog-пунктов про legacy links/e2e-навигацию) конфликтует с `Forbidden changes`, потому что закрытие таких задач обычно требует правок `src/**` и `tests/**`, а skill разрешает только `docs/*`.
2. Нет жесткой матрицы “тип изменения -> конкретные docs”, поэтому skill может править лишние документы и выходить за узкую ответственность «док-синхронизации по факту кода».
- Medium:
1. Сильное дублирование с `AGENTS.md` (инварианты, обязательные обновления docs, правила source of truth). Лучше ссылаться на разделы `AGENTS.md`, а не копировать формулировки.
2. `Allowed changes` включает `docs/ops-runbook.md`, но в workflow нет критерия, когда runbook обязателен; это создает серую зону и лишние правки.
3. `Commands: NOT PRESENT` допустимо, но стоит явно добавить правило: при этом skill не запускает build/test/migrate и только фиксирует факт `NOT PRESENT`.
- Minor:
1. Где добавить `UNCONFIRMED/NOT PRESENT`: добавить явный пункт `UNCONFIRMED`, если факт взят из backlog/runbook и не перепроверен по `src/**`; добавить `NOT PRESENT` для любых команд в рамках этого skill (док-режим).
2. Примеры задач (когда вызывать):
   1. Переименован route в `src/app/(app)` и нужно синхронизировать `docs/project-spec.md` + `docs/content-structure.md`.
   2. Добавлен новый публичный submit endpoint, нужно описать контракт и ограничения в docs.
   3. Изменена структура `home` global, нужно обновить mapping контента в docs.
   4. Изменены поля `products`, нужно обновить описание инвариантов каталога.
   5. Обновлены UI-токены в `globals.css`, нужно синхронизировать `docs/design-rules.md`.
   6. Исправлены legacy-ссылки `/search -> /shop`, нужно обновить docs-навигацию.
   7. Синхронизация docs после изменения slug-логики с `slugifyRussian`.
   8. Проверка и фиксация расхождений runbook с фактическими route-файлами.

## blacktech-payload-schema-change
- Critical:
1. `Allowed changes` слишком широкие (`src/blocks/**`, `src/hooks/**`, `src/plugins/**`) и пересекаются с другими зонами; skill может увести задачу из “schema-change” в общую feature-разработку.
2. В `When to use` включены изменения frontend-контракта (`/shop`, `/products/[slug]`, submit flows), но allowlist не включает явные route-handler файлы (`src/app/(app)/api/**`), из-за чего scope неоднозначен.
3. `migrate` указан в командах, но у skill нет жесткого fail-safe “по умолчанию не запускать”; лучше явно пометить как `NOT PRESENT`, пока пользователь отдельно не запросил запуск миграции.
- Medium:
1. Большое дублирование с `AGENTS.md` по security/hook-инвариантам; лучше оставить краткие ссылки на обязательные правила вместо повторов.
2. Workflow смешивает schema-check и route/UI-check, что частично дублирует `blacktech-page-block` и `blacktech-docs-guard`.
3. Шаг обновления документации не включает четкий критерий для `docs/ops-runbook.md`, хотя файл в allowlist есть.
4. Команды реалистичны: все перечисленные скрипты существуют в `package.json`.
- Minor:
1. Где добавить `UNCONFIRMED/NOT PRESENT`: добавить `UNCONFIRMED`, если влияние schema-change на публичные API/routes не подтверждено кодом; добавить `NOT PRESENT` для rollback-процедуры (в skill не описана).
2. Примеры задач (когда вызывать):
   1. Добавить поле `phone` в `requests` и обновить типы.
   2. Переименовать поле в `pages`/`home` и синхронизировать docs.
   3. Усилить `access` для `contact-messages` без нарушения инвариантов.
   4. Добавить hook с nested-операцией и корректной передачей `req/context`.
   5. Изменить схему `products.specifications` с проверкой инвариантов.
   6. Добавить admin component path для поля и запустить `generate:importmap`.
   7. Изменить plugin-конфиг, влияющий на Payload schema.
   8. Подготовить и верифицировать миграцию структуры БД (`migrate:status` -> по задаче `migrate`).

## blacktech-page-block
- Critical:
1. `Allowed changes` содержит слишком широкие директории (`src/components/**`, `src/collections/Products/**`), из-за чего skill может затронуть нерелевантные области (checkout/account/ecommerce) и выйти за “block-layer”.
2. Scope частично пересекается с `blacktech-payload-schema-change` (schema/config) и `blacktech-docs-guard` (docs sync), из-за чего возможен конфликт “какой skill главный”.
3. Нет явного запрета на правки API/routes вне block-задачи; есть только инварианты, но не строгий denylist по путям.
- Medium:
1. Workflow реалистичный, команды существуют в `package.json`, но не хватает preflight-шага “подтвердить host layout и текущий block registry” перед изменениями.
2. Правило про сохранение long-form паттернов корректно, но формулировка “не заменять на generic шаблон” может блокировать обоснованный рефакторинг без описанного exception-процесса.
3. Сильное содержательное дублирование инвариантов из `AGENTS.md`.
- Minor:
1. Где добавить `UNCONFIRMED/NOT PRESENT`: добавить `UNCONFIRMED` для UI-утверждений, которые не подтверждены скриншотами/реальным рендером; добавить `NOT PRESENT` для visual regression checks (в skill нет команды и это нормально).
2. Примеры задач (когда вызывать):
   1. Добавить новый block type в `src/blocks/**` и подключить в `RenderBlocks`.
   2. Расширить `ServiceCenter` блок новым полем CTA и рендером.
   3. Подключить существующий блок в `home.layout`.
   4. Подключить блок в `pages.layout` для CMS-страниц по slug.
   5. Изменить block-схему в `Products` layout без ломки товарных инвариантов.
   6. Обновить компонент блока под текущие design-rules и токены.
   7. Удалить deprecated block из схемы и рендера с синхронизацией docs.
   8. Изменить admin-path блока и регенерировать import map.

## blacktech-release-check
- Critical:
1. Skill позиционируется как проверочный, но `Allowed changes` допускает режим “исправлений”; это размывает ответственность и может превратить check в незапланированную разработку.
2. Workflow требует проверки инвариантов/docs-sync, но не задает минимально воспроизводимых шагов для этих проверок (есть риск декларативного отчета без фактической валидации).
3. Нет жесткого правила, что при недоступной среде команды должны быть отмечены как `not run`, иначе возможны ложные `ready`.
- Medium:
1. Команды реалистичны и существуют в `package.json`, но нет явных preconditions (env, тестовые данные, browser dependencies для e2e).
2. Сильное дублирование раздела проверок из `AGENTS.md`; лучше короткая ссылка на AGENTS + конкретный release checklist.
3. Не хватает явного ограничения “никаких `lint:fix`/массовых автоправок” в режиме проверки.
- Minor:
1. Где добавить `UNCONFIRMED/NOT PRESENT`: добавить `UNCONFIRMED` для проверок, которые не удалось выполнить из-за окружения; добавить `NOT PRESENT` для security/perf/load-проверок (не входят в текущий scope skill).
2. Примеры задач (когда вызывать):
   1. Pre-commit прогон после изменения route в `src/app/(app)`.
   2. Проверка перед PR после изменения Payload schema.
   3. Pre-deploy прогон перед релизом на прод.
   4. Проверка после правок submit endpoint-валидации.
   5. Проверка после фиксов legacy-links (`/search`, `/recover-password`, `/shop/order/:id`).
   6. Проверка после изменений в long-form блоках и дизайн-токенах.
   7. Валидация docs-sync после серии backend/frontend изменений.
   8. Финальный `ready/not ready` gate для релизного решения.
