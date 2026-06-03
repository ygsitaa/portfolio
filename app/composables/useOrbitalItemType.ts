import type { OrbitalItemData, OrbitalAboutItem, OrbitalProjectItem } from '../data/orbitalItems'

/**
 * Type guard to check if an item is an about item
 */
export function isAboutItem(item: OrbitalItemData): item is OrbitalAboutItem {
  return item.type === 'about'
}

/**
 * Type guard to check if an item is a project item
 */
export function isProjectItem(item: OrbitalItemData): item is OrbitalProjectItem {
  return item.type === 'project'
}

/**
 * Get the type of an orbital item
 */
export function getItemType(item: OrbitalItemData): 'about' | 'project' {
  return item.type
}
