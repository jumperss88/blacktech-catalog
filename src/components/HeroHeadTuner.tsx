'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

type HeroHeadTunerState = {
  widthPx: number
  offsetX: number
  offsetY: number
  opacity: number
}

const STORAGE_KEY = 'hero-head-tuner-v1'
const STYLE_TAG_ID = 'hero-head-tuner-runtime-styles'

const defaults: HeroHeadTunerState = {
  widthPx: 360,
  offsetX: 0,
  offsetY: 0,
  opacity: 1,
}

const buildCSS = (state: HeroHeadTunerState) => `
.hero-head-tunable {
  width: ${state.widthPx}px !important;
  transform: translate(${state.offsetX}px, calc(-50% + ${state.offsetY}px)) !important;
  opacity: ${state.opacity} !important;
}
`

export const HeroHeadTuner = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<HeroHeadTunerState>(defaults)

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Partial<HeroHeadTunerState>
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

  const setValue = <K extends keyof HeroHeadTunerState>(key: K, value: HeroHeadTunerState[K]) => {
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
    <div style={{ position: 'fixed', right: 16, bottom: 108, zIndex: 1001 }}>
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
        Head тюнер
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
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Позиция и размер head.svg</div>

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Ширина: {state.widthPx}px
          </label>
          <input
            type="range"
            min={120}
            max={760}
            value={state.widthPx}
            onChange={(e) => setValue('widthPx', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Смещение X: {state.offsetX}px
          </label>
          <input
            type="range"
            min={-400}
            max={400}
            value={state.offsetX}
            onChange={(e) => setValue('offsetX', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Смещение Y: {state.offsetY}px
          </label>
          <input
            type="range"
            min={-240}
            max={240}
            value={state.offsetY}
            onChange={(e) => setValue('offsetY', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />

          <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
            Прозрачность: {state.opacity.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={state.opacity}
            onChange={(e) => setValue('opacity', Number(e.target.value))}
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

