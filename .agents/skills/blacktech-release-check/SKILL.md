# blacktech-release-check

Цель: выполнить release-gate проверку проекта `blacktech-catalog` в режиме `report-only` и выдать структурированный отчёт `Ready` или `Blocked`.

## Обязательный режим

1. Этот skill всегда работает только в режиме `report-only`.
2. Режим `apply minimal fix` запрещён и не используется по умолчанию.
3. Любые исправления выполняются только отдельным skill/отдельной задачей после согласования.
4. В рамках `release-check` нужно только зафиксировать blockers и предложить минимальный план фикса без выполнения.

## Allowed

1. Запуск release-проверок:
   - `lint`
   - `typecheck`
   - `tests` (integration/e2e по задаче)
   - `build`
2. Сбор фактов по результатам запусков.
3. Подготовка отчёта `Ready/Blocked` с ключевыми причинами.

## Forbidden

1. Любые изменения файлов в репозитории.
2. Любые миграции и любые изменения БД/данных.
3. Любые деплой-действия.
4. Любой ручной автоген (типы/importmap и т.п.).
5. Любые git publish-действия (push, PR publish, release publish, tag publish).
6. Любое применение фиксов в рамках этого skill.

## Порядок работы

1. Проверить актуальные проектные команды release-gate в `package.json` и/или проектной документации.
2. Последовательно выполнить необходимые проверки для релиза.
3. Зафиксировать статус каждой проверки и ключевой failure (если есть).
4. Сформировать blockers (top N по критичности и влиянию на релиз).
5. Сформировать минимальный план фикса без выполнения изменений.

## Output format (строго)

```md
## Release Check Verdict
Ready | Blocked

## Checks
| command | status | key failure |
|---|---|---|
| <command> | PASS \| FAIL \| NOT RUN \| NOT APPLICABLE \| NOT PRESENT | <short reason or -> |

## Blockers (top N)
1. <blocker summary + impact>
2. <blocker summary + impact>

## Minimal Fix Plan (no execution)
1. <smallest safe fix step>
2. <validation step after fix>
3. <release re-check step>
```

Требования к отчёту:
1. Если есть хотя бы один `FAIL` в релиз-критичной проверке, verdict = `Blocked`.
2. `key failure` должен быть коротким, проверяемым фактом.
3. В `Minimal Fix Plan` запрещено описывать уже выполненные действия; только план.
4. Статус пропуска не используется.
5. Если команда есть, но не запускалась, status = `NOT RUN` + краткая причина.
6. Если проверка не относится к задаче, status = `NOT APPLICABLE`.
7. Если script отсутствует, status = `NOT PRESENT`.
## When to use
Use this skill for report-only readiness checks when you need an explicit go/no-go signal:

1. Pre-PR: before opening a pull request after a medium/large code change.
2. Pre-merge: before merging a branch into the main integration branch.
3. Pre-deploy: before production or staging deployment decision.
4. After route changes: added/removed/renamed routes, redirects, or navigation rewiring.
5. After Payload schema/data-contract changes: collections/globals/fields/access/hooks/migrations.
6. After public form/API contract changes: submit endpoints, validation, payload shape.
7. After broad refactors: cross-module updates that can cause hidden regressions.

## When NOT to use
Do not use this skill in tasks that require implementation or where checks are intentionally disallowed:

1. Feature development or bug fixing is requested (this skill does not implement fixes).
2. User explicitly запрещает запуск проверок/команд для проверки.
3. Task is docs-only/content-only with no behavior/runtime impact and no release gate needed.
4. You need schema/code changes first; readiness check should run after implementation, not instead of it.
5. The request is to execute migrations/deploy/ops actions (this skill is report-only verification).
6. The request expects auto-remediation (for example, "apply minimal fix") rather than findings.
7. CI/CD policy already provides the required gate and user did not ask for a separate local report.

## UNCONFIRMED
Always prefer factual reporting over assumptions:

1. При неизвестных предусловиях или состоянии среды факт помечается `UNCONFIRMED` без догадок.
2. If environment state is unclear (deps not installed, env vars unknown, service availability unclear), mark fact as `UNCONFIRMED`.
3. If a prerequisite cannot be verified from available facts, keep conclusion report-only and explicitly state `UNCONFIRMED`.
4. Never invent command names, script aliases, or inferred checks to fill gaps.

## NOT PRESENT
1. If a referenced check command/script is absent from `package.json` scripts, mark it as `NOT PRESENT`.

## Report-only Enforcement
This skill is strictly report-only:

1. Do not modify source code, schema, docs, config, or data while running this skill.
2. Do not perform auto-remediation, including any "apply minimal fix" behavior.
3. Output must remain a findings/status report with clear status and `Blocked` rationale.
