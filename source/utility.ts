export type PlainObject = { [key: string]: any };

export function fromEntries(list: (string | any)[][]) {
    return list.reduce(
        (object, [key, value]) => ((object[key] = value), object),
        {} as PlainObject
    );
}

const meta = new WeakMap();

function defineMetadata(key: string, value: any, target: Object) {
    const data = meta.get(target) || {};

    data[key] = value;

    meta.set(target, data);
}

function getMetadata(key: string, target: Object) {
    const data: PlainObject | null = meta.get(target);

    if (data) return data[key];
}

export const Reflect = { defineMetadata, getMetadata };
