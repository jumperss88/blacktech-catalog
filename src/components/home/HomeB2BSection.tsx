import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const b2bPoints = [
  {
    title: '44-ФЗ / 223-ФЗ',
    description: 'Работа с тендерными поставками',
    icon: '/icons/b2b/gerb.svg',
    iconClass: 'is-gerb',
  },
  {
    title: 'Партнерские условия',
    description: 'Для дилеров и интеграторов',
    icon: '/icons/b2b/hands.svg',
    iconClass: 'is-hands',
  },
  {
    title: 'Проектный подход',
    description: 'Подбор решений под задачу',
    icon: '/icons/b2b/notebook.svg',
    iconClass: 'is-notebook',
  },
] as const

export function HomeB2BSection() {
  return (
    <section className="container home-b2b-section-wrap" aria-label="B2B сотрудничество">
      <div className="home-b2b-section">
        <div className="home-b2b-main">
          <p className="home-b2b-eyebrow">B2B / ГОСЗАКУПКИ / ПАРТНЕРСТВО</p>
          <h2 className="home-b2b-title">Тендерные поставки и дилерское сотрудничество</h2>
          <p className="home-b2b-description">
            Работаем с государственными и коммерческими заказчиками по 44-ФЗ и 223-ФЗ: подготавливаем
            предложения под закупочные процедуры, сопровождаем поставки и учитываем требования проекта.
            Для дилеров, интеграторов и профильных партнеров предлагаем индивидуальные условия,
            проектные цены и долгосрочное сотрудничество.
          </p>
        </div>

        <aside className="home-b2b-side" aria-label="Ключевые преимущества">
          <ul className="home-b2b-points" role="list">
            {b2bPoints.map((point) => (
              <li className="home-b2b-point" key={point.title}>
                <div className="home-b2b-point-content">
                  <p className="home-b2b-point-title">{point.title}</p>
                  <p className="home-b2b-point-description">{point.description}</p>
                </div>
                <Image
                  alt=""
                  aria-hidden="true"
                  className={`home-b2b-point-icon ${point.iconClass}`}
                  height={62}
                  src={point.icon}
                  width={62}
                />
              </li>
            ))}
          </ul>

          <Link className="home-b2b-button" href="/kontakty">
            Обсудить сотрудничество
          </Link>
        </aside>
      </div>
    </section>
  )
}
