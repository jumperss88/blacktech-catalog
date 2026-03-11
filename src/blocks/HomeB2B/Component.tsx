import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { HomeB2BBlock as HomeB2BBlockType } from '@/payload-types'

const iconMap: Record<string, { className: string; src: string }> = {
  tender: {
    className: 'is-gerb',
    src: '/icons/b2b/gerb.svg',
  },
  partner: {
    className: 'is-hands',
    src: '/icons/b2b/hands.svg',
  },
  project: {
    className: 'is-notebook',
    src: '/icons/b2b/notebook.svg',
  },
}

export const HomeB2BBlock: React.FC<HomeB2BBlockType> = (props) => {
  const points = props.points || []

  return (
    <section className="container home-b2b-section-wrap" aria-label="B2B сотрудничество">
      <div className="home-b2b-section">
        <div className="home-b2b-main">
          <p className="home-b2b-eyebrow">{props.eyebrow}</p>
          <h2 className="home-b2b-title">{props.title}</h2>
          <p className="home-b2b-description">{props.description}</p>
        </div>

        <aside className="home-b2b-side" aria-label="Ключевые преимущества">
          <ul className="home-b2b-points" role="list">
            {points.map((point, index) => {
              const iconKey = point.icon || 'tender'
              const icon = iconMap[iconKey] || iconMap.tender

              return (
                <li className="home-b2b-point" key={`${point.title}-${index}`}>
                  <div className="home-b2b-point-content">
                    <p className="home-b2b-point-title">{point.title}</p>
                    <p className="home-b2b-point-description">{point.description}</p>
                  </div>
                  <Image
                    alt=""
                    aria-hidden="true"
                    className={`home-b2b-point-icon ${icon.className}`}
                    height={62}
                    src={icon.src}
                    width={62}
                  />
                </li>
              )
            })}
          </ul>

          <Link className="home-b2b-button" href={props.buttonUrl || '/kontakty'}>
            {props.buttonLabel}
          </Link>
        </aside>
      </div>
    </section>
  )
}
