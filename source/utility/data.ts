const meta = new WeakMap();

function defineMetadata(key: string, value: any, target: Object) {
    const data = meta.get(target) || {};

    data[key] = value;

    meta.set(target, data);
}

function getMetadata(key: string, target: Object) {
    const data: Record<string, any> | null = meta.get(target);

    if (data) return data[key];
}

export const Reflect = { defineMetadata, getMetadata };

export function toHyphenCase(raw: string) {
    return raw.replace(/[A-Z]+/g, match => '-' + match.toLowerCase());
}

export function toCamelCase(raw: string) {
    return raw.replace(/-[a-z]/g, match => match[1].toUpperCase());
}
