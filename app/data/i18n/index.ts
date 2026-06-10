import type { Locale } from '~/composables/useLocale'
import type { OrbitalItemData } from '~/data/orbitalItems'
import { orbitalItemsBase } from '~/data/orbitalItems'

export interface NavHints {
  desktopLine1: string
  desktopLine2: string
  mobileLine1: string
  mobileLine2: string
}

export interface AboutContent {
  title: string
  intro: {
    beforeRole: string
    role: string
    mid: string
    location: string
    after: string
  }
  closingParagraph: string
  contactHeading: string
  contactLabels: {
    email: string
    linkedin: string
    instagram: string
  }
  contactValues: {
    email: string
    linkedin: string
    instagram: string
  }
}

interface OrbitalAboutTranslation {
  label: string
  subtitle: string
}

interface OrbitalProjectTranslation extends OrbitalAboutTranslation {
  description: string
}

type OrbitalTranslation = OrbitalAboutTranslation | OrbitalProjectTranslation

const navHints: Record<Locale, NavHints> = {
  en: {
    desktopLine1: '<  Navigate through side arrows, Left/Right Keys or Scrolling  >',
    desktopLine2: '- Press Enter or Left Click to Open -',
    mobileLine1: '<  Navigate by swiping or through side arrows  >',
    mobileLine2: '- Tap to Open -',
  },
  fr: {
    desktopLine1: '<  Naviguez avec les flèches latérales, les touches directionnelles du clavier ou la molette de votre souris  >',
    desktopLine2: '- Appuyez sur Entrée ou cliquez pour ouvrir -',
    mobileLine1: '<  Naviguez en glissant ou avec les flèches latérales  >',
    mobileLine2: '- Appuyez pour ouvrir -',
  },
}

const aboutContent: Record<Locale, AboutContent> = {
  en: {
    title: 'About Me',
    intro: {
      beforeRole: 'Welcome to my portfolio! I\'m Daniel Hodiamont, ',
      role: 'Web & UI/UX Designer',
      mid: ' located in ',
      location: 'Enghien, Belgium',
      after: ' passionate about designing beautiful and functional digital experiences. For a business, having an online presence is important in making your work flourish the best it can, let me help you make it a reality. Reflecting your identity from a showcase website to an e-commerce solution with assets such as logos or graphic design like posters or business cards.',
    },
    closingParagraph: 'Contact me through your favorite way below!',
    contactHeading: 'Contact',
    contactLabels: {
      email: 'E-mail :',
      instagram: 'Instagram :',
      linkedin: 'LinkedIn :',
    },
    contactValues: {
      email: 'daniel.hodiamont@gmail.com',
      instagram: 'instagram.com/ygsitaa',
      linkedin: 'linkedin.com/in/daniel-hodiamont',
    },
  },
  fr: {
    title: 'À propos',
    intro: {
      beforeRole: 'Bienvenue sur mon portfolio ! Je suis Daniel Hodiamont, ',
      role: 'designer Web & UI/UX',
      mid: ' basé à ',
      location: 'Enghien, Belgique',
      after: ', passionné par la conception d\'expériences digitales belles et fonctionnelles. Pour une entreprise, une présence en ligne est essentielle pour faire prospérer son activité au mieux — laissez-moi vous aider à la concrétiser. Du site vitrine à la solution e-commerce reflétant votre identité, avec des supports tels que logos ou design graphique (affiches, cartes de visite, etc.).',
    },
    closingParagraph: 'Contactez-moi par votre moyen préféré ci-dessous !',
    contactHeading: 'Contact',
    contactLabels: {
      email: 'E-mail :',
      instagram: 'Instagram :',
      linkedin: 'LinkedIn :',
    },
    contactValues: {
      email: 'daniel.hodiamont@gmail.com',
      instagram: 'instagram.com/ygsitaa',
      linkedin: 'linkedin.com/in/daniel-hodiamont',
    },
  },
}

const orbitalTranslations: Record<Locale, Record<string, OrbitalTranslation>> = {
  en: {
    about: { label: 'ABOUT', subtitle: 'Who am i?' },
    project1: {
      label: 'Ephemeral',
      subtitle: 'Photography Portfolio',
      description: '',
    },
    project2: {
      label: 'Inthesky',
      subtitle: 'Interactive weather website',
      description: '',
    },
  },
  fr: {
    about: { label: 'À PROPOS', subtitle: 'Qui suis-je ?' },
    project1: {
      label: 'Ephemeral',
      subtitle: 'Portfolio de photographie',
      description: '',
    },
    project2: {
      label: 'Inthesky',
      subtitle: 'Site internet avec météo intéractive',
      description: '',
    },
  },
}

export function getNavHints(locale: Locale): NavHints {
  return navHints[locale]
}

export function getAboutContent(locale: Locale): AboutContent {
  return aboutContent[locale]
}

export function getOrbitalItems(locale: Locale): OrbitalItemData[] {
  const translations = orbitalTranslations[locale]

  return orbitalItemsBase.map((base) => {
    const t = translations[base.id]
    if (!t) {
      throw new Error(`Missing orbital translation for id "${base.id}" locale "${locale}"`)
    }

    if (base.type === 'about') {
      return {
        ...base,
        label: t.label,
        subtitle: t.subtitle,
      }
    }

    const projectT = t as OrbitalProjectTranslation
    return {
      ...base,
      label: projectT.label,
      subtitle: projectT.subtitle,
      description: projectT.description,
    }
  })
}
