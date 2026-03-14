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
