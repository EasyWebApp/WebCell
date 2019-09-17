import morphDOM from 'morphdom';

interface ComponentMeta {
    tagName: string;
    extends?: string;
}

export function component(meta: ComponentMeta) {
    return (Class: Function) => {
        customElements.define(meta.tagName, Class, { extends: meta.extends });
    };
}

export function mixin(superClass = HTMLElement) {
    abstract class WebCell extends superClass {
        private root: DocumentFragment;

        constructor({ mode }: any = {}) {
            super();

            this.root = this.attachShadow({ mode: mode || 'open' });

            this.update();
        }

        abstract render(): Element;

        protected update() {
            const node = this.render(),
                { childNodes } = this.root;

            if (!childNodes[0]) this.root.appendChild(node);
            else morphDOM(childNodes[0], node);
        }
    }

    return WebCell;
}

const spawn = document.createElement('template');

export function create(
    name: string,
    props: any = {},
    ...children: (string | Element)[]
) {
    spawn.innerHTML = `<${name} />`;

    const element = spawn.content.firstElementChild!;
    // @ts-ignore
    for (const key in props) element[key] = props[key];

    element.append(...children);

    return element;
}
