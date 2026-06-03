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
    color: '#c084fc',
    emissiveColor: '#fff',
    iconEmoji: '📖',
    selfRotationSpeed: 1,
    type: 'about' as const,
  },
  {
    id: 'project1',
    color: '#c084fc',
    emissiveColor: '#fff',
    iconEmoji: '🏛️',
    selfRotationSpeed: 1,
    type: 'project' as const,
    url: 'https://youtu.be/dQw4w9WgXcQ',
    image: 'project1.jpg',
  },
  {
    id: 'project2',
    color: '#c084fc',
    emissiveColor: '#fff',
    iconEmoji: '💾',
    selfRotationSpeed: 1,
    type: 'project' as const,
    url: 'https://www.youtube.com/watch?v=0fOHh5Q7Q1E',
    image: 'project2.jpg',
  },
  {
    id: 'project3',
    color: '#c084fc',
    emissiveColor: '#fff',
    iconEmoji: '🔑',
    selfRotationSpeed: 1,
    type: 'project' as const,
    url: 'https://youtu.be/6JwvH44ZLx0',
    image: 'project3.jpg',
  },
  {
    id: 'project4',
    color: '#c084fc',
    emissiveColor: '#fff',
    iconEmoji: '🔑',
    selfRotationSpeed: 1,
    type: 'project' as const,
    url: 'https://oldschool.runescape.com/',
    image: 'project4.jpg',
  },
  {
    id: 'project5',
    color: '#c084fc',
    emissiveColor: '#fff',
    iconEmoji: '🔑',
    selfRotationSpeed: 1,
    type: 'project' as const,
    url: 'https://www.youtube.com/watch?v=j734gLbQFbU',
    image: 'project5.jpg',
  },
]
