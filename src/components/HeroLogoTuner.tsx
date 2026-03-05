'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

type HeroLogoTunerState = {
  widthPx: number
  offsetX: number
  offsetY: number
  gapBottom: number
}

const STORAGE_KEY = 'hero-logo-tuner-v1'
const STYLE_TAG_ID = 'hero-logo-tuner-runtime-styles'

const defaults: HeroLogoTunerState = {
  widthPx: 300,
  offsetX: 0,
  offsetY: 0,
  gapBottom: 16,
}

const buildCSS = (state: HeroLogoTunerState) => `
.hero-logo-tunable {
  width: ${state.widthPx}px !important;
  transform: translate(${state.offsetX}px, ${state.offsetY}px) !important;
  margin-bottom: ${state.gapBottom}px !important;
}
`

export const HeroLogoTuner = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<HeroLogoTunerState>(defaults)

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Partial<HeroLogoTunerState>
      setState((prev) => ({ ...prev, ...parsed }))
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const cssText = useMemo(() => buildCSS(state), [state])

  useEffect(() => {
    let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null

    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = STYLE_TAG_ID
      document.head.appendChild(styleTag)
    }

    styleTag.textContent = cssText
  }, [cssText])

  if (pathname !== '/') return null

  const setValue = <K extends keyof HeroLogoTunerState>(key: K, value: HeroLogoTunerState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const resetAll = () => {
    setState(defaults)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  }

  const copyCSS = async () => {
    await navigator.clipboard.writeText(cssText)
  }

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 62, zIndex: 1001 }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          borderRadius: 10,
          border: '1px solid #d1d5db',
          background: '#fff',
          padding: '8px 12px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,.08)',
        }}
      >
        Лого тюнер
      </button>

      {isOpen ? (
        <div
          style={{
            marginTop: 8,
            width: 320,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: '#fff',
            boxShadow: '0 16px 40px rgba(0,0,0,.12)',
            padding: 12,
            color: '#111827',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Позиция и размер лого</div>

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Ширина: {state.widthPx}px
          </label>
          <input
            type="range"
            min={120}
            max={620}
            value={state.widthPx}
            onChange={(e) => setValue('widthPx', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Смещение X: {state.offsetX}px
          </label>
          <input
            type="range"
            min={-220}
            max={220}
            value={state.offsetX}
            onChange={(e) => setValue('offsetX', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Смещение Y: {state.offsetY}px
          </label>
          <input
            type="range"
            min={-140}
            max={180}
            value={state.offsetY}
            onChange={(e) => setValue('offsetY', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Отступ снизу: {state.gapBottom}px
          </label>
          <input
            type="range"
            min={0}
            max={80}
            value={state.gapBottom}
            onChange={(e) => setValue('gapBottom', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 12 }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={copyCSS}
              style={{
                flex: 1,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                background: '#fff',
                padding: '7px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Копировать CSS
            </button>
            <button
              type="button"
              onClick={resetAll}
              style={{
                flex: 1,
                borderRadius: 8,
                border: '1px solid #ef4444',
                background: '#fff',
                color: '#b91c1c',
                padding: '7px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Сбросить
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

