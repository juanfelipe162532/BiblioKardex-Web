// device-session.service.ts - Servicio para gestionar sesiones de dispositivos

import { apiClient } from './api';

const SESSION_TOKEN_KEY = 'bibliokardex_session_token';

export interface DeviceSession {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'web';
  platform?: string;
  platformVersion?: string;
  browser?: string;
  browserVersion?: string;
  appVersion?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  loginAt: string;
  lastActivityAt: string;
  isActive: boolean;
  operador?: {
    id: string;
    nombre: string;
    email: string;
    cargoTemporal?: string;
  };
}

export interface SessionStats {
  totalActiveSessions: number;
  totalSessions: number;
  mobileDevices: number;
  webDevices: number;
  byDeviceType: Record<string, number>;
  byPlatform: Record<string, number>;
}

/**
 * Guarda el session token en localStorage
 */
export function saveSessionToken(token: string): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

/**
 * Obtiene el session token guardado
 */
export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

/**
 * Limpia el session token
 */
export function clearSessionToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Obtiene todas las sesiones activas de una biblioteca
 */
export async function getActiveSessions(bibliotecaId: string): Promise<DeviceSession[]> {
  const response = await apiClient.get(`/device-sessions/biblioteca/${bibliotecaId}`);
  return response.data.sessions;
}

/**
 * Obtiene las sesiones de un operador específico
 */
export async function getOperadorSessions(operadorId: string): Promise<DeviceSession[]> {
  const response = await apiClient.get(`/device-sessions/operador/${operadorId}`);
  return response.data.sessions;
}

/**
 * Revoca una sesión específica
 */
export async function revokeSession(
  sessionId: string,
  reason: string = 'Sesión cerrada desde otro dispositivo'
): Promise<void> {
  await apiClient.delete(`/device-sessions/${sessionId}`, {
    data: { reason }
  });
}

/**
 * Revoca todas las sesiones excepto la actual
 */
export async function revokeAllOtherSessions(
  bibliotecaId: string,
  operadorId?: string
): Promise<number> {
  const sessionToken = getSessionToken();

  if (!sessionToken) {
    throw new Error('No hay sesión activa');
  }

  const response = await apiClient.post('/device-sessions/revoke-others', {
    sessionToken,
    bibliotecaId,
    operadorId,
  }, {
    headers: {
      'X-Session-Token': sessionToken,
    }
  });

  return response.data.revokedCount;
}

/**
 * Actualiza la actividad de la sesión actual
 */
export async function updateActivity(): Promise<void> {
  const sessionToken = getSessionToken();

  if (!sessionToken) {
    return; // No hay sesión activa
  }

  try {
    await apiClient.put('/device-sessions/activity', {
      sessionToken,
    }, {
      headers: {
        'X-Session-Token': sessionToken,
      }
    });
  } catch (error) {
    // No lanzar error, solo log
    console.warn('Error actualizando actividad:', error);
  }
}

/**
 * Obtiene estadísticas de sesiones
 */
export async function getSessionStats(bibliotecaId: string): Promise<SessionStats> {
  const response = await apiClient.get(`/device-sessions/stats/${bibliotecaId}`);
  return response.data.stats;
}

/**
 * Inicia un heartbeat para mantener la sesión activa
 * Retorna una función para detener el heartbeat
 */
export function startSessionHeartbeat(intervalMinutes: number = 5): () => void {
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    updateActivity();
  }, intervalMs);

  // Retornar función para detener el heartbeat
  return () => {
    clearInterval(intervalId);
  };
}
