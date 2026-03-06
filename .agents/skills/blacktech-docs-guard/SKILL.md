---
name: blacktech-docs-guard
description: Узкий skill для синхронизации `docs/*` по уже выполненным изменениям в коде и конфиге blacktech-catalog.
---

## Responsibility
1. Только документирование фактов, подтвержденных кодом и конфигом.
2. Никакой реализации фич, фиксов кода, миграций и тестовых правок.
3. Инварианты и обязательные правила брать из `AGENTS.md` (разделы 3, 5, 10), не дублировать их дословно.

## When to use
1. После изменения routes в `src/app/(app)/**`, когда требуется синхронизировать docs.
2. После изменения Payload-моделей (`collections/globals/blocks/fields/access/hooks`), влияющих на контракты контента.
3. После изменения публичных submit endpoint'ов и форм.
4. После изменения content mapping (`home`, `pages` по slug, `header/footer`).
5. После изменения UI токенов или дизайн-правил в `src/app/(app)/globals.css`.
6. Только после того, как backlog-пункт уже реализован в коде и смержен, и осталась только docs-синхронизация; не использовать skill для "закрытия backlog" одними документами.
7. После сверки расхождений между docs и фактическими route/schema файлами.

## When NOT to use
1. Нужно менять любые файлы вне `docs/*`.
2. Задача еще требует правок `src/**` или `tests/**` для закрытия бага или фичи.
3. Нужны build/test/migrate/deploy/DB операции.
4. Факты нельзя подтвердить кодом или конфигом.
5. Пользователь явно запретил изменения документации.

## Allowed
1. `docs/project-spec.md`
2. `docs/content-structure.md`
3. `docs/design-rules.md`
4. `docs/ops-runbook.md` (только если подтверждено изменение команд/процедур запуска и проверок: `package.json` scripts и/или operational sections в `AGENTS.md`; иначе не трогать)

## Forbidden
1. Любые файлы в `src/**`, `scripts/**`, `tests/**`, `.env*`, `blacktech-catalog.db`.
2. `AGENTS.md`.
3. Автогенерируемые файлы в `src/app/(payload)/**`.
4. Миграции, деплой, сидирование и автоматизации.
5. "Лезть в чужие файлы": если задача требует кодовых правок, передать ее в профильный skill.
6. Любые новые файлы вне `docs/**` запрещены.

## Commands
NOT PRESENT

Правило:
1. Этот skill не запускает `lint`, `test`, `build`, `migrate`.
2. В отчете поле `Commands` всегда равно `NOT PRESENT`.
3. `Commands: NOT PRESENT` в этом skill означает, что запуск команд не предусмотрен моделью skill, а не то, что "команду не запускали" в конкретном кейсе.

## Docs matrix (mandatory)
1. `routes` -> `docs/project-spec.md` + `docs/content-structure.md`
2. `payload model` -> `docs/project-spec.md` + `docs/content-structure.md`
3. `public endpoints/forms` -> `docs/project-spec.md` + `docs/content-structure.md`
4. `UI tokens/design rules` -> `docs/design-rules.md`
5. `ops/dev procedure` -> `docs/ops-runbook.md`

## Workflow
1. Зафиксировать тип изменения из `Docs matrix`.
2. Подтвердить факт по коду и конфигу, а не по старым тредам.
3. Обновить только документы из выбранной строки матрицы.
4. Любой неподтвержденный факт пометить как `UNCONFIRMED`.
5. Не использовать `NOT PRESENT` как признак "команды не запускали"; по правилам skill команды не запускаются, а в отчете `Commands` всегда `NOT PRESENT`.
6. Перед завершением убедиться, что файлы вне allowlist не изменялись.

## UNCONFIRMED
1. Любые неподтвержденные факты обязательно маркируются как `UNCONFIRMED`.
2. Догадки и предположения нельзя выдавать как подтвержденные факты.
3. Поле `UNCONFIRMED` обязательно в финальном отчете этого skill даже если значение `none`.

## Output format
1. `Scope type:` `routes | payload model | public endpoints/forms | UI tokens/design rules | ops/dev procedure`
2. `Updated docs:` список измененных `docs/*`
3. `Matrix row applied:` какая строка `Docs matrix` использована
4. `Confirmed facts:` краткий список подтвержденных фактов
5. `Commands:` `NOT PRESENT`
6. `UNCONFIRMED:` список или `none`
7. `Out-of-scope requests:` что отклонено как "чужие файлы" (или `none`)

## Example tasks
1. Синхронизация docs после переименования route в `src/app/(app)/**`.
2. Описание нового публичного submit endpoint после кодовой реализации.
3. Обновление content-structure после изменения `home` global.
4. Обновление инвариантов каталога после изменения полей `products`.
5. Синхронизация `docs/design-rules.md` после изменения токенов в `globals.css`.
6. Док-фиксация legacy-links (`/search -> /shop`) после фактического кода.
7. Док-синхронизация после изменения slug-логики с `slugifyRussian`.
8. Актуализация runbook после подтвержденного изменения release/check процедур.
