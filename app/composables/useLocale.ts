import { provide, inject, type Ref } from 'vue'

export type Locale = 'en' | 'fr'

const LOCALE_KEY = Symbol('locale')

export function provideLocale(locale: Ref<Locale>) {
  provide(LOCALE_KEY, locale)
}

export function useLocale(): Ref<Locale> {
  const locale = inject<Ref<Locale>>(LOCALE_KEY)
  if (!locale) {
    throw new Error('useLocale must be used within a provideLocale provider')
  }
  return locale
}
