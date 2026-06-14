'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { content, type Content, type Lang } from '@/data/content'

const STORAGE_KEY = 'bonim-lang'
const DEFAULT_LANG: Lang = 'he'

type Dir = 'rtl' | 'ltr'

function dirFor(lang: Lang): Dir {
  return lang === 'he' ? 'rtl' : 'ltr'
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  dir: Dir
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

interface LanguageProviderProps {
  children: ReactNode
}

/**
 * LanguageProvider — owns the HE/EN language state for the whole app.
 *
 * - Default language is Hebrew ('he'), rendered RTL.
 * - The chosen language persists to localStorage under 'bonim-lang'.
 * - On every change, `document.documentElement.lang` and `.dir` are updated so the
 *   page mirrors correctly and assistive tech announces the right language.
 *
 * The server renders `<html lang="he" dir="rtl">` first; this provider re-syncs the
 * stored preference on mount, so there is no hydration mismatch (initial client
 * render also starts from 'he').
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG)

  // Read persisted preference after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'he' || stored === 'en') {
        setLangState(stored)
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — keep default.
    }
  }, [])

  // Reflect language onto <html> + persist on every change.
  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dirFor(lang)
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore write failures
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
  }, [])

  const toggle = useCallback(() => {
    setLangState((prev) => (prev === 'he' ? 'en' : 'he'))
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, toggle, dir: dirFor(lang) }),
    [lang, setLang, toggle]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

/** Access the current language, setter, toggle, and text direction. */
export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLang must be used within a <LanguageProvider>')
  }
  return ctx
}

/** Returns the content tree for the active language: `content[lang]`. */
export function useContent(): Content {
  const { lang } = useLang()
  return content[lang]
}
