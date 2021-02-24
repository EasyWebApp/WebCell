export function toHyphenCase(raw: string) {
    return raw.replace(
        /[A-Z]+/g,
        (match, offset) => `${offset ? '-' : ''}${match.toLowerCase()}`
    );
}

export function toCamelCase(raw: string, large = false) {
    return raw.replace(/^[a-z]|-[a-z]/g, (match, offset) =>
        offset || large ? (match[1] || match[0]).toUpperCase() : match
    );
}
