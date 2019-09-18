import createElement from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';
import { patch, fromEntries } from './utility';

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

        abstract render(): VNode;

        protected update() {
            const node = this.render(),
                { firstElementChild } = this.root;

            if (firstElementChild) {
                patch(firstElementChild, node);
                return;
            }

            const element =
                node.sel && document.createElement(node.sel.split(/[#.:]/)[0]);

            if (!element) return;

            patch(element, node);

            this.root.appendChild(element);
        }
    }

    return WebCell;
}

export function create(
    name: string,
    { class: className, style, ...props }: any = {},
    ...children: (string | VNode)[]
) {
    className =
        typeof className === 'string'
            ? fromEntries(className.split(/\s+/).map(name => [name, true]))
            : null;

    return createElement(name, { props, class: className, style }, children);
}
