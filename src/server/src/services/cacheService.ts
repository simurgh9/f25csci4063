export class CacheService<T = any> {
    private store: Map<string, { value: T; expiresAt: number | null }> = new Map();


    set(key: string, value: T, ttlMs?: number): void {
        const expiresAt = ttlMs ? Date.now() + ttlMs : null;
        this.store.set(key, { value, expiresAt });
    }

    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;

        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.store.delete(key);
            return undefined;
        }

        return entry.value;
    }

    delete(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}
