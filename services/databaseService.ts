import { User, PatternHistoryItem, ActivityLog } from '../types';

class DatabaseService {
  private API_BASE = '/api';
  private STORAGE_KEYS = {
    PATTERNS: 'fd_patterns',
    USERS: 'fd_users',
    LOGS: 'fd_logs'
  };
  
  // Start with null to indicate "not yet checked"
  private backendAvailable: boolean | null = null;
  private isCheckingBackend = false;

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 500): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }

  private async checkConnectivity(): Promise<boolean> {
    if (this.backendAvailable !== null) return this.backendAvailable;
    if (this.isCheckingBackend) return false;

    this.isCheckingBackend = true;
    try {
      // Quick probe to the stats endpoint
      const response = await this.fetchWithTimeout(`${this.API_BASE}/stats`, { method: 'GET' }, 400);
      this.backendAvailable = response.ok;
    } catch (e) {
      this.backendAvailable = false;
    } finally {
      this.isCheckingBackend = false;
    }
    return this.backendAvailable;
  }

  private async fetchApi<T>(path: string, options?: RequestInit): Promise<T | null> {
    // If we already know the backend is down, don't even try
    if (this.backendAvailable === false) return null;

    try {
      const response = await this.fetchWithTimeout(`${this.API_BASE}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options?.headers }
      }, 800); // Slightly longer for real data requests but still snappy
      
      this.backendAvailable = true;
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn(`Backend unreachable at ${path}:`, e);
      // Mark backend as unavailable if we hit a timeout or connection error
      if (e instanceof Error && (e.name === 'AbortError' || e.message.includes('Failed to fetch'))) {
        this.backendAvailable = false;
      }
      return null;
    }
  }

  private getFromLocal<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private saveToLocal<T>(key: string, data: T[]): void {
    let items = [...data];
    const attemptSave = (): boolean => {
      try {
        localStorage.setItem(key, JSON.stringify(items));
        return true;
      } catch (e) {
        if (e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError')) {
          if (items.length > 1) {
            items.pop(); 
            return attemptSave();
          }
        }
        return false;
      }
    };
    attemptSave();
  }

  public get isConfigured(): boolean {
    return this.backendAvailable === true;
  }

  async getUsers(): Promise<User[]> {
    const local = this.getFromLocal<User>(this.STORAGE_KEYS.USERS);
    
    // We attempt to get remote users in the background or if connectivity is checked
    // For immediate UI, we can return local first if available.
    if (this.backendAvailable === false) return local;

    const remote = await this.fetchApi<User[]>('/users');
    if (!remote) return local;

    const combined = [...local];
    remote.forEach(ru => {
      if (!combined.find(lu => lu.id === ru.id)) combined.push(ru);
    });
    return combined;
  }

  async saveUser(user: User): Promise<void> {
    const local = this.getFromLocal<User>(this.STORAGE_KEYS.USERS);
    const updated = [user, ...local.filter(u => u.id !== user.id)].slice(0, 50);
    this.saveToLocal(this.STORAGE_KEYS.USERS, updated);
    
    // Non-blocking remote save
    this.fetchApi('/users', { method: 'POST', body: JSON.stringify(user) }).catch(() => {});
  }

  async getPatterns(): Promise<PatternHistoryItem[]> {
    const local = this.getFromLocal<PatternHistoryItem>(this.STORAGE_KEYS.PATTERNS);
    const remote = await this.fetchApi<PatternHistoryItem[]>('/patterns');
    return remote || local;
  }

  async savePattern(pattern: PatternHistoryItem): Promise<void> {
    const local = this.getFromLocal<PatternHistoryItem>(this.STORAGE_KEYS.PATTERNS);
    const updated = [pattern, ...local].slice(0, 3); 
    this.saveToLocal(this.STORAGE_KEYS.PATTERNS, updated);
    this.fetchApi('/patterns', { method: 'POST', body: JSON.stringify(pattern) }).catch(() => {});
  }

  async deletePattern(id: string): Promise<void> {
    const local = this.getFromLocal<PatternHistoryItem>(this.STORAGE_KEYS.PATTERNS);
    this.saveToLocal(this.STORAGE_KEYS.PATTERNS, local.filter(p => p.id !== id));
    this.fetchApi(`/patterns/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  async getLogs(): Promise<ActivityLog[]> {
    const remote = await this.fetchApi<ActivityLog[]>('/logs');
    const local = this.getFromLocal<ActivityLog>(this.STORAGE_KEYS.LOGS);
    const combined = [...local];
    if (remote) {
      remote.forEach(rl => {
        if (!combined.find(ll => ll.id === rl.id)) combined.push(rl);
      });
    }
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }

  async logActivity(userId: string, userName: string, action: string, detail: string, type: ActivityLog['type'] = 'info'): Promise<void> {
    const log: ActivityLog = { id: crypto.randomUUID(), userId, userName, action, detail, timestamp: Date.now(), type };
    const local = this.getFromLocal<ActivityLog>(this.STORAGE_KEYS.LOGS);
    const updatedLogs = [log, ...local].slice(0, 100);
    this.saveToLocal(this.STORAGE_KEYS.LOGS, updatedLogs);
    
    // FIRE AND FORGET - Do not wait for logs to sync to backend to proceed with UI
    this.fetchApi('/logs', { method: 'POST', body: JSON.stringify(log) }).catch(() => {});
  }

  async getStats() {
    const remote = await this.fetchApi<any>('/stats');
    if (remote) return remote;
    
    const patterns = this.getFromLocal<PatternHistoryItem>(this.STORAGE_KEYS.PATTERNS);
    const users = this.getFromLocal<User>(this.STORAGE_KEYS.USERS);
    return {
      totalDesigns: patterns.length,
      totalUsers: users.length,
      last24hCount: 0,
      adminCount: users.filter(u => u.role === 'admin').length,
      dbStatus: this.backendAvailable === false ? 'Local Cache' : 'Connecting...',
      driver: 'LocalStorage Fallback'
    };
  }
}

export const db = new DatabaseService();