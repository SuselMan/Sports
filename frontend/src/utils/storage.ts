export class AppStorage {
  private readonly prefix: string;

  constructor(prefix = 'sports_') {
    this.prefix = prefix;
  }

  private key(k: string) {
    return `${this.prefix}${k}`;
  }

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.key(key));
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.key(key), JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.key(key));
    } catch {
      // ignore storage errors
    }
  }
}

export const storage = new AppStorage();
