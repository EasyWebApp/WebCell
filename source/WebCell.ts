import { VNode } from 'snabbdom/vnode';
import { patch, PlainObject } from './utility';

export function mixin(superClass = HTMLElement) {
    abstract class WebCell extends superClass {
        static tagName = '';

        private root: DocumentFragment;
        private tick?: Promise<any>;

        protected readonly props: PlainObject = {};

        constructor({ mode }: any = {}) {
            super();

            this.root = this.attachShadow({ mode: mode || 'open' });
        }

        connectedCallback() {
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
