import { Banner } from '@payloadcms/ui'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Добро пожаловать в панель управления!</h4>
      </Banner>
      Что можно сделать дальше:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' с несколькими товарами и страницами, чтобы быстро запустить проект, затем '}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">откройте сайт</a>
          {' и посмотрите результат.'}
        </li>
        <li>
          {'Перейдите в '}
          <a
            href="https://dashboard.stripe.com/test/apikeys"
            rel="noopener noreferrer"
            target="_blank"
          >
            Stripe за API-ключами
          </a>
          {' . Если нужно, создайте аккаунт, затем добавьте ключи в переменные окружения и перезапустите сервер. Подробнее в '}
          <a
            href="https://github.com/payloadcms/payload/blob/main/templates/ecommerce/README.md#stripe"
            rel="noopener noreferrer"
            target="_blank"
          >
            README
          </a>
          {'.'}
        </li>
        <li>
          {'Настройте '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            коллекции
          </a>
          {' и добавьте нужные '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            поля
          </a>
          {'. Если вы только начинаете работать с Payload, рекомендуем посмотреть '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            руководство по старту
          </a>
          {'.'}
        </li>
      </ul>
      {'Подсказка: этот блок — '}
      <a
        href="https://payloadcms.com/docs/admin/components#base-component-overrides"
        rel="noopener noreferrer"
        target="_blank"
      >
        кастомный компонент
      </a>
      , его можно убрать в любой момент, изменив <strong>payload.config</strong>.
    </div>
  )
}
