let _apiUrl = 'indexdb'
let _isDev = false

export function configureSDK(config: { apiUrl: string; isDev?: boolean }) {
  _apiUrl = config.apiUrl
  _isDev = config.isDev ?? false
}

export function getSDKApiUrl(): string {
  return _apiUrl
}

export function getSDKIsDev(): boolean {
  return _isDev
}

export const IS_PROD_KEY = 'rahat-is-prod'

export function getIsProd(): boolean {
  try {
    return localStorage.getItem(IS_PROD_KEY) === 'true'
  } catch {
    return false
  }
}

export function setIsProd(value: boolean): void {
  localStorage.setItem(IS_PROD_KEY, String(value))
}
