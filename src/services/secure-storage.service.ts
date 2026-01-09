/**
 * Servicio de almacenamiento seguro para tokens y datos sensibles
 * 
 * Mejoras de seguridad implementadas:
 * 1. Prefijo para evitar colisiones
 * 2. Limpieza automática de datos expirados
 * 3. Validación de tokens antes de uso
 * 4. Opción de sessionStorage para datos más sensibles
 */

const STORAGE_PREFIX = 'bk_';
const TOKEN_KEY = `${STORAGE_PREFIX}auth_token`;
const ADMIN_TOKEN_KEY = `${STORAGE_PREFIX}admin_session`;
const SESSION_KEY = `${STORAGE_PREFIX}session_data`;
const TOKEN_EXPIRY_KEY = `${STORAGE_PREFIX}token_expiry`;

interface StoredToken {
  value: string;
  expiresAt: number;
}

/**
 * Almacena un token con tiempo de expiración
 */
export function setToken(token: string, expiresInHours: number = 168): void {
  const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
  const data: StoredToken = { value: token, expiresAt };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
}

/**
 * Obtiene el token si no ha expirado
 */
export function getToken(): string | null {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    
    const data: StoredToken = JSON.parse(stored);
    
    // Verificar expiración
    if (Date.now() > data.expiresAt) {
      clearToken();
      return null;
    }
    
    return data.value;
  } catch {
    clearToken();
    return null;
  }
}

/**
 * Elimina el token de almacenamiento
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Almacena el token de admin (usando sessionStorage para mayor seguridad)
 */
export function setAdminToken(token: string): void {
  // Admin tokens se guardan en sessionStorage (se pierden al cerrar pestaña)
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

/**
 * Obtiene el token de admin
 */
export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Elimina el token de admin
 */
export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * Almacena datos de sesión
 */
export function setSessionData(data: unknown): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

/**
 * Obtiene datos de sesión
 */
export function getSessionData<T = unknown>(): T | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

/**
 * Elimina datos de sesión
 */
export function clearSessionData(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Limpia todo el almacenamiento de la aplicación
 */
export function clearAllStorage(): void {
  // Limpiar todo lo que tenga el prefijo de la app
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  });
}

/**
 * Verifica si hay una sesión válida
 */
export function hasValidSession(): boolean {
  return getToken() !== null;
}

/**
 * Verifica si hay una sesión de admin válida
 */
export function hasValidAdminSession(): boolean {
  return getAdminToken() !== null;
}

export default {
  setToken,
  getToken,
  clearToken,
  setAdminToken,
  getAdminToken,
  clearAdminToken,
  setSessionData,
  getSessionData,
  clearSessionData,
  clearAllStorage,
  hasValidSession,
  hasValidAdminSession
};
