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
      after: ' passionate about creating beautiful and functional digital experiences. For a business, having an online presence is important in making your work flourish the best it can, let me help you make it a reality. From a showcase website to an e-commerce solution reflecting your digital identity with assets such as logos or graphic design like posters or business cards.',
    },
    closingParagraph: 'Contact me through your favorite way below!',
    contactHeading: 'Contact',
    contactLabels: {
      email: 'Email:',
      linkedin: 'LinkedIn:',
      instagram: 'Instagram:',
    },
    contactValues: {
      email: 'daniel.hodiamont@gmail.com',
      linkedin: 'linkedin.com/in/yourprofile',
      instagram: 'instagram.com/ygsitaa',
    },
  },
  fr: {
    title: 'À propos',
    intro: {
      beforeRole: 'Bienvenue sur mon portfolio ! Je suis Daniel Hodiamont, ',
      role: 'designer Web & UI/UX',
      mid: ' basé à ',
      location: 'Enghien, Belgique',
      after: ', passionné par la création d\'expériences numériques belles et fonctionnelles. Pour une entreprise, une présence en ligne est essentielle pour faire prospérer son activité au mieux — laissez-moi vous aider à la concrétiser. Du site vitrine à la solution e-commerce reflétant votre identité numérique, avec des supports tels que logos ou design graphique (affiches, cartes de visite, etc.).',
    },
    closingParagraph: 'Contactez-moi par votre moyen préféré ci-dessous !',
    contactHeading: 'Contact',
    contactLabels: {
      email: 'E-mail :',
      linkedin: 'LinkedIn :',
      instagram: 'Instagram :',
    },
    contactValues: {
      email: 'daniel.hodiamont@gmail.com',
      linkedin: 'linkedin.com/in/yourprofile',
      instagram: 'instagram.com/ygsitaa',
    },
  },
}

const orbitalTranslations: Record<Locale, Record<string, OrbitalTranslation>> = {
  en: {
    about: { label: 'ABOUT', subtitle: 'Who I am' },
    project1: {
      label: 'PROJECT 1',
      subtitle: 'Web Design Portfolio',
      description: 'A modern web design portfolio showcase',
    },
    project2: {
      label: 'PROJECT 2',
      subtitle: 'Data Visualization',
      description: 'Interactive data visualization dashboard',
    },
    project3: {
      label: 'PROJECT 3',
      subtitle: 'Web Application',
      description: 'Full-stack web application',
    },
    project4: {
      label: 'PROJECT 4',
      subtitle: 'Mobile App',
      description: 'Cross-platform mobile application',
    },
    project5: {
      label: 'PROJECT 5',
      subtitle: 'AI Integration',
      description: 'Machine learning powered tool',
    },
  },
  fr: {
    about: { label: 'À PROPOS', subtitle: 'Qui je suis' },
    project1: {
      label: 'PROJET 1',
      subtitle: 'Portfolio Web Design',
      description: 'Vitrine portfolio web design moderne',
    },
    project2: {
      label: 'PROJET 2',
      subtitle: 'Visualisation de données',
      description: 'Tableau de bord interactif de visualisation de données',
    },
    project3: {
      label: 'PROJET 3',
      subtitle: 'Application Web',
      description: 'Application web full-stack',
    },
    project4: {
      label: 'PROJET 4',
      subtitle: 'Application mobile',
      description: 'Application mobile multiplateforme',
    },
    project5: {
      label: 'PROJET 5',
      subtitle: 'Intégration IA',
      description: 'Outil alimenté par l\'apprentissage automatique',
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
