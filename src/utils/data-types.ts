export class MapList<T = unknown> extends Map<string, T[]> {
    push(key: string, ...items: T[]) {
        const value = this.get(key);
        if (!value) this.set(key, items);
        else value.push(...items);
    }
    getList(key: string): T[] {
        return this.get(key) || [];
    }
    getKeys() {
        return Array.from(this.keys());
    }
}

export function isValidArrayIndex(x: unknown): x is number {
    return Number.isInteger(x) && (x as number) >= 0;
}
export function isNonEmptyArray<Item>(arr?: Item[]): arr is Item[] {
    return Array.isArray(arr) && arr.length > 0;
}
