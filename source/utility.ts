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

const spawn = document.createElement('template'),
    cache: PlainObject = {};

export function elementTypeOf(tagName: string) {
    if (cache[tagName]) return cache[tagName];

    spawn.innerHTML = `<${tagName} />`;

    const { firstElementChild: node } = spawn.content;

    return (cache[tagName] =
        node instanceof HTMLElement && !(node instanceof HTMLUnknownElement)
            ? 'html'
            : 'xml');
}

export function delegate(selector: string, handler: Function) {
    return function(this: Node, event: Event) {
        var node,
            path = event.composedPath();

        while ((node = path.shift()) && node !== event.currentTarget)
            if (node instanceof HTMLElement && node.matches(selector))
                return handler.call(
                    this,
                    event,
                    node,
                    (event as CustomEvent).detail
                );
    };
}
