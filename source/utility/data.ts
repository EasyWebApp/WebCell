export function toHyphenCase(raw: string) {
    return raw.replace(/[A-Z]+/g, match => '-' + match.toLowerCase());
}

export function toCamelCase(raw: string) {
    return raw.replace(/-[a-z]/g, match => match[1].toUpperCase());
}
