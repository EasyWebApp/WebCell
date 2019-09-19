import { VNode } from 'snabbdom/vnode';
import { patch, PlainObject } from './utility';

const { find } = Array.prototype;

const hiddenTag = ['style', 'link', 'script'];

export interface WebCellComponent extends Element {
    visibleRoot?: Element;
}

export function mixin(superClass = HTMLElement) {
    abstract class WebCell extends superClass implements WebCellComponent {
        static get observedAttributes() {
            return Reflect.getMetadata('attributes', this);
        }

        attributeChangedCallback(name: string, _: string, value: string) {
            try {
                value = JSON.parse(value);
            } finally {
                this.commit(name, value);
            }
        }

        private root: DocumentFragment;
        private tick?: Promise<any>;

        protected readonly props: PlainObject = {};

        constructor({ mode }: any = {}) {
            super();

            this.root = this.attachShadow({ mode: mode || 'open' });

            const CSS = Reflect.getMetadata('style', this.constructor);

            if (!CSS) return;

            const style = document.createElement('style');

            style.textContent = CSS;

            this.root.appendChild(style);
        }

        get visibleRoot(): Element | undefined {
            return find.call(
                this.root.childNodes,
                ({ nodeType, nodeName }) =>
                    nodeType === 1 &&
                    !hiddenTag.includes(nodeName.toLowerCase())
            );
        }

        connectedCallback() {
            this.update();
        }

        abstract render(): VNode;

        protected update() {
            const node = this.render(),
                { visibleRoot } = this;

            if (visibleRoot) {
                patch(visibleRoot, node);
                return;
            }

            const element =
                node.sel && document.createElement(node.sel.split(/[#.:]/)[0]);

            if (!element) return;

            patch(element, node);

            this.root.appendChild(element);
        }

        commit(key: string, value: any) {
            this.props[key] = value;

            return (this.tick =
                this.tick ||
                new Promise(resolve =>
                    self.requestAnimationFrame(() => {
                        this.update();

                        this.tick = undefined;
                        resolve();
                    })
                ));
        }
    }

    return WebCell;
}
