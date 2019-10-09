import { Reflect, PlainObject, delegate } from './utility';
import { DOMEventDelegateHandler } from './decorator';
import { visibleFirstOf, patch, render } from './renderer';
import { VNode } from 'snabbdom/vnode';

export interface WebCellComponent<P = {}> extends Element {
    connectedCallback?(): void;
    attributeChangedCallback?(
        name: keyof P,
        oldValue: string,
        newValue: string
    ): void;
    adoptedCallback?(): void;
    disconnectedCallback?(): void;
    visibleRoot?: Element;
}

type Props<T> = {
    [P in keyof T]: T[P];
};

export function mixin<P>(
    superClass = HTMLElement
): { new (): WebCellComponent<P> } {
    class WebCell extends superClass implements WebCellComponent<P> {
        static get observedAttributes() {
            return Reflect.getMetadata('attributes', this);
        }

        attributeChangedCallback(name: keyof P, _: string, value: string) {
            try {
                value = JSON.parse(value);
            } finally {
                this.commit(name, value);
            }
        }

        private root: DocumentFragment | HTMLElement;
        private vTree?: VNode;
        private tick?: Promise<any>;

        protected readonly props: Props<P> = {} as Props<P>;

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

        render(): VNode | void {}

        protected update() {
            const newTree = this.render();

            if (newTree)
                this.vTree = this.vTree
                    ? patch(this.vTree, newTree)
                    : render(newTree, this.root);
        }

        commit(key: keyof P, value: any) {
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
