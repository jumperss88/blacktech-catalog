'use client'

import { createUrl } from '@/utilities/createUrl'
import { SearchIcon, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

export const SearchOverlay: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 30)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (!shellRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParamsString])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.elements.namedItem('search') as HTMLInputElement | null

    const newParams = new URLSearchParams(searchParams.toString())
    const value = input?.value?.trim() || ''

    if (value) {
      newParams.set('q', value)
    } else {
      newParams.delete('q')
    }

    setIsOpen(false)
    router.push(createUrl('/shop', newParams))
  }

  return (
    <div className="headerSearchShell" ref={shellRef}>
      <button
        type="button"
        className="headerSearchButton"
        aria-label="Открыть поиск"
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'inline-flex' }}
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {isOpen ? (
        <form className="headerSearchPanel headerSearchPanelInline" onSubmit={onSubmit} role="search" aria-label="Поиск по товарам">
          <SearchIcon className="headerSearchPanelIcon h-5 w-5" />

          <input
            ref={inputRef}
            autoComplete="off"
            className="headerSearchPanelInput"
            defaultValue={searchParams.get('q') || ''}
            name="search"
            placeholder="Поиск по товарам..."
            type="text"
          />

          <button type="button" className="headerSearchClose" aria-label="Закрыть поиск" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </form>
      ) : null}
    </div>
  )
}
