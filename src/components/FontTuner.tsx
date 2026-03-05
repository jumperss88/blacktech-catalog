'use client'

import React, { useEffect, useMemo, useState } from 'react'

type BlockId =
  | 'product-detail-price'
  | 'shop-card-price'
  | 'tile-price'
  | 'product-title'
  | 'product-card-title'

type BlockStyle = {
  fontFamily: string
  fontSize: number
  fontWeight: number
  letterSpacing: number
  lineHeight: number
}

type StylesMap = Record<BlockId, BlockStyle>

type BlockConfig = {
  id: BlockId
  label: string
  selector: string
  defaults: BlockStyle
}

const STORAGE_KEY = 'font-tuner-v1'

const FONT_OPTIONS = [
  { label: 'Geist Sans', value: 'var(--font-sans), sans-serif' },
  { label: 'Manrope', value: 'var(--font-manrope), var(--font-sans), sans-serif' },
  { label: 'Montserrat', value: 'var(--font-montserrat), var(--font-sans), sans-serif' },
  { label: 'Rubik', value: 'var(--font-rubik), var(--font-sans), sans-serif' },
  { label: 'Nunito Sans', value: 'var(--font-nunito), var(--font-sans), sans-serif' },
  { label: 'PT Sans', value: 'var(--font-pt-sans), var(--font-sans), sans-serif' },
  { label: 'Fira Sans', value: 'var(--font-fira-sans), var(--font-sans), sans-serif' },
  { label: 'IBM Plex Sans', value: 'var(--font-ibm-plex), var(--font-sans), sans-serif' },
  { label: 'Lora', value: 'var(--font-lora), serif' },
  { label: 'Merriweather', value: 'var(--font-merriweather), serif' },
  { label: 'Playfair Display', value: 'var(--font-playfair), serif' },
  { label: 'Roboto Slab', value: 'var(--font-roboto-slab), serif' },
  { label: 'Oswald', value: 'var(--font-oswald), sans-serif' },
  { label: 'Geist Mono', value: 'var(--font-mono), monospace' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
]

const BLOCKS: BlockConfig[] = [
  {
    id: 'product-detail-price',
    label: 'Цена на странице товара',
    selector: '.product-detail-price',
    defaults: {
      fontFamily: 'var(--font-sans), sans-serif',
      fontSize: 17,
      fontWeight: 650,
      letterSpacing: 0,
      lineHeight: 1.2,
    },
  },
  {
    id: 'shop-card-price',
    label: 'Цена в каталоге (карточка)',
    selector: '.shop-page .product-card-price',
    defaults: {
      fontFamily: 'var(--font-manrope), var(--font-sans), sans-serif',
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.2,
    },
  },
  {
    id: 'tile-price',
    label: 'Цена в карусели/тайлах',
    selector: '.tile-label-price',
    defaults: {
      fontFamily: 'var(--font-sans), sans-serif',
      fontSize: 17,
      fontWeight: 650,
      letterSpacing: 0,
      lineHeight: 1.2,
    },
  },
  {
    id: 'product-title',
    label: 'Заголовок товара',
    selector: '.product-detail-title',
    defaults: {
      fontFamily: 'var(--font-manrope), var(--font-sans), sans-serif',
      fontSize: 34,
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.1,
    },
  },
  {
    id: 'product-card-title',
    label: 'Название карточки',
    selector: '.product-card-title',
    defaults: {
      fontFamily: 'var(--font-manrope), var(--font-sans), sans-serif',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.2,
    },
  },
]

const buildDefaults = (): StylesMap => {
  return BLOCKS.reduce((acc, block) => {
    acc[block.id] = block.defaults
    return acc
  }, {} as StylesMap)
}

const toCSS = (styles: StylesMap) => {
  return BLOCKS.map((block) => {
    const style = styles[block.id]
    return `${block.selector}{
  font-family:${style.fontFamily} !important;
  font-size:${style.fontSize}px !important;
  font-weight:${style.fontWeight} !important;
  letter-spacing:${style.letterSpacing}px !important;
  line-height:${style.lineHeight} !important;
}`
  }).join('\n\n')
}

export const FontTuner = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<BlockId>('product-detail-price')
  const [styles, setStyles] = useState<StylesMap>(buildDefaults())

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Partial<StylesMap>
      setStyles((prev) => ({ ...prev, ...parsed }))
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(styles))
  }, [styles])

  const cssText = useMemo(() => toCSS(styles), [styles])

  useEffect(() => {
    const styleTagId = 'font-tuner-runtime-styles'
    let styleTag = document.getElementById(styleTagId) as HTMLStyleElement | null

    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleTagId
      document.head.appendChild(styleTag)
    }

    styleTag.textContent = cssText
  }, [cssText])

  const setBlockStyle = <K extends keyof BlockStyle>(key: K, value: BlockStyle[K]) => {
    setStyles((prev) => ({
      ...prev,
      [selectedBlock]: {
        ...prev[selectedBlock],
        [key]: value,
      },
    }))
  }

  const currentStyle = styles[selectedBlock]

  const resetCurrent = () => {
    const block = BLOCKS.find((item) => item.id === selectedBlock)
    if (!block) return

    setStyles((prev) => ({
      ...prev,
      [selectedBlock]: block.defaults,
    }))
  }

  const resetAll = () => {
    const defaults = buildDefaults()
    setStyles(defaults)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  }

  const copyCSS = async () => {
    await navigator.clipboard.writeText(cssText)
  }

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000 }}>
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
        Aа Тюнер
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
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Шрифтовой тюнер</div>

          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Блок</label>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value as BlockId)}
            style={{ width: '100%', marginBottom: 10, padding: 6 }}
          >
            {BLOCKS.map((block) => (
              <option key={block.id} value={block.id}>
                {block.label}
              </option>
            ))}
          </select>

          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Семейство</label>
          <select
            value={currentStyle.fontFamily}
            onChange={(e) => setBlockStyle('fontFamily', e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 6 }}
          >
            {FONT_OPTIONS.map((fontOption) => (
              <option key={fontOption.value} value={fontOption.value}>
                {fontOption.label}
              </option>
            ))}
          </select>

          <label style={{ display: 'block', fontSize: 12 }}>Размер: {currentStyle.fontSize}px</label>
          <input
            type="range"
            min={12}
            max={64}
            value={currentStyle.fontSize}
            onChange={(e) => setBlockStyle('fontSize', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 10 }}
          />

          <label style={{ display: 'block', fontSize: 12 }}>Вес: {currentStyle.fontWeight}</label>
          <input
            type="range"
            min={300}
            max={900}
            step={50}
            value={currentStyle.fontWeight}
            onChange={(e) => setBlockStyle('fontWeight', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 10 }}
          />

          <label style={{ display: 'block', fontSize: 12 }}>
            Интервал букв: {currentStyle.letterSpacing}px
          </label>
          <input
            type="range"
            min={-1}
            max={3}
            step={0.1}
            value={currentStyle.letterSpacing}
            onChange={(e) => setBlockStyle('letterSpacing', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 10 }}
          />

          <label style={{ display: 'block', fontSize: 12 }}>
            Межстрочный: {currentStyle.lineHeight.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.9}
            max={1.8}
            step={0.05}
            value={currentStyle.lineHeight}
            onChange={(e) => setBlockStyle('lineHeight', Number(e.target.value))}
            style={{ width: '100%', marginBottom: 12 }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={resetCurrent} style={{ flex: 1, padding: '6px 8px' }}>
              Сброс блока
            </button>
            <button type="button" onClick={copyCSS} style={{ flex: 1, padding: '6px 8px' }}>
              Копировать CSS
            </button>
          </div>
          <button
            type="button"
            onClick={resetAll}
            style={{ marginTop: 8, width: '100%', padding: '6px 8px' }}
          >
            Сбросить всё
          </button>
        </div>
      ) : null}
    </div>
  )
}
