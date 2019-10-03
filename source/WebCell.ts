import { Reflect, PlainObject } from './utility';
import { visibleFirstOf, render } from './renderer';
import { VNode } from 'snabbdom/vnode';

export interface WebCellComponent extends Element {
    visibleRoot?: Element;
}

export function mixin(superClass = HTMLElement): any {
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

        private root: DocumentFragment | HTMLElement;
        private tick?: Promise<any>;

        protected readonly props: PlainObject = {};

        constructor({ mode }: any = {}) {
            super();

            this.root =
                Reflect.getMetadata('renderTarget', this.constructor) ===
                'children'
                    ? this
                    : this.attachShadow({ mode: mode || 'open' });

            const CSS = Reflect.getMetadata('style', this.constructor);

            if (!CSS) return;

            const style = document.createElement('style');

            style.textContent = CSS;

            this.root.appendChild(style);
        }

        get visibleRoot() {
            return visibleFirstOf(this.root);
        }

        connectedCallback() {
            this.update();
        }

        abstract render(): VNode;

        protected update() {
            render(this.render(), this.root);
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
