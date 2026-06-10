export interface OrbitalItemBase {
  id: string
  label: string
  subtitle: string
  color: string
  emissiveColor: string
  iconEmoji: string
  selfRotationSpeed: number
}

export interface OrbitalAboutItem extends OrbitalItemBase {
  type: 'about'
}

export interface OrbitalProjectItem extends OrbitalItemBase {
  type: 'project'
  url: string
  description: string
  image?: string
}

export type OrbitalItemData = OrbitalAboutItem | OrbitalProjectItem

/** Non-translatable orbital configuration (labels filled via i18n). */
export const orbitalItemsBase = [
  {
    id: 'about',
    color: '#13346d',
    emissiveColor: '#fff',
    iconEmoji: '📖',
    selfRotationSpeed: 1,
    type: 'about' as const,
  },
  {
    id: 'project1',
    color: '#13346d',
    emissiveColor: '#fff',
    iconEmoji: '🏛️',
    selfRotationSpeed: 1,
    type: 'project' as const,
    url: 'https://web-ephemeralm.vercel.app/',
    image: 'project1.jpg',
  },
  {
    id: 'project2',
    color: '#13346d',
    emissiveColor: '#fff',
    iconEmoji: '💾',
    selfRotationSpeed: 1,
    type: 'project' as const,
    url: 'https://web-intheskyy.vercel.app/',
    image: 'project2.jpg',
  },

]
