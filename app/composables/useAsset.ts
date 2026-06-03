import { joinURL } from 'ufo'

export function useAsset(path: string): string {
  if (!path || path.startsWith('http') || path.startsWith('data:')) {
    return path
  }
  const config = useRuntimeConfig()
  return joinURL(config.app.baseURL || '/', path)
}
