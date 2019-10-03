import { Reflect, PlainObject, delegate } from './utility';
import { DOMEventDelegateHandler } from './decorator';
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

        [key: string]: any;

        constructor({ mode }: any = {}) {
            super();

            const renderChildren =
                Reflect.getMetadata('renderTarget', this.constructor) ===
                'children';

            const root = (this.root = renderChildren
                ? this
                : this.attachShadow({ mode: mode || 'open' }));

            const events: DOMEventDelegateHandler[] =
                Reflect.getMetadata('DOM-Event', Object.getPrototypeOf(this)) ||
                [];

            for (const { type, selector, method } of events) {
                if (renderChildren && /^:host/.test(selector))
                    console.warn(
                        `[WebCell] DOM Event delegation of "${selector}" won't work if you don't invoke "this.attachShadow()" manually.`
                    );

                root.addEventListener(
                    type,
                    delegate(selector, this[method]).bind(this)
                );
            }

            const CSS = Reflect.getMetadata('style', this.constructor);

            if (!CSS) return;

            const style = document.createElement('style');

            style.textContent = CSS;

            root.appendChild(style);
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

        emit(
            event: string,
            detail: any,
            { cancelable, bubbles, composed }: EventInit = {}
        ) {
            return this.dispatchEvent(
                new CustomEvent(event, {
                    detail,
                    cancelable,
                    bubbles,
                    composed
                })
            );
        }
    }

    return WebCell;
}
