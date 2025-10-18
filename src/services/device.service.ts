// device.service.ts - Servicio para capturar información del dispositivo/navegador

/**
 * Genera o recupera un ID único para este navegador
 */
export function getDeviceId(): string {
  const DEVICE_ID_KEY = 'bibliokardex_device_id';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generar nuevo UUID v4
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Detecta información del navegador
 */
export function getBrowserInfo(): { browser: string; version: string } {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = '';

  // Detectar navegador
  if (ua.includes('Edg/')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
    browser = 'Opera';
    const match = ua.match(/(?:Opera|OPR)\/(\d+)/);
    version = match ? match[1] : '';
  }

  return { browser, version };
}

/**
 * Detecta el sistema operativo
 */
export function getPlatformInfo(): { platform: string; version: string } {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  let os = 'Unknown';
  let version = '';

  if (ua.includes('Win')) {
    os = 'Windows';
    if (ua.includes('Windows NT 10.0')) version = '10/11';
    else if (ua.includes('Windows NT 6.3')) version = '8.1';
    else if (ua.includes('Windows NT 6.2')) version = '8';
    else if (ua.includes('Windows NT 6.1')) version = '7';
  } else if (ua.includes('Mac')) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    if (match) {
      version = match[1].replace(/_/g, '.');
    }
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    const match = ua.match(/Android (\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    const match = ua.match(/OS (\d+)_(\d+)/);
    if (match) {
      version = `${match[1]}.${match[2]}`;
    }
  }

  return { platform: os, version };
}

/**
 * Genera un nombre descriptivo para el dispositivo
 */
export function getDeviceName(): string {
  const browserInfo = getBrowserInfo();
  const platformInfo = getPlatformInfo();

  return `${browserInfo.browser} en ${platformInfo.platform}`;
}

/**
 * Obtiene información completa del dispositivo
 */
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'web';
  platform: string;
  platformVersion: string;
  browser: string;
  browserVersion: string;
  appVersion: string;
  screenResolution?: string;
  language?: string;
}

export function getDeviceInfo(appVersion: string = '1.0.0'): DeviceInfo {
  const browserInfo = getBrowserInfo();
  const platformInfo = getPlatformInfo();

  return {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    deviceType: 'web',
    platform: platformInfo.platform,
    platformVersion: platformInfo.version,
    browser: browserInfo.browser,
    browserVersion: browserInfo.version,
    appVersion,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };
}

/**
 * Limpia el deviceId (útil para testing)
 */
export function clearDeviceId(): void {
  localStorage.removeItem('bibliokardex_device_id');
}
