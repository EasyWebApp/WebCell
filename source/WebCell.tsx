import { Reflect, toCamelCase, Fragment, delegate } from './utility';
import { watch, DOMEventDelegateHandler } from './decorator';
import { VNodeChildElement, createCell, render } from './renderer';
import { VNode } from 'snabbdom/vnode';

export interface WebCellComponent<P = {}> extends Element {
    connectedCallback(): void;
    attributeChangedCallback?(
        name: string,
        oldValue: string,
        newValue: string
    ): void;
    adoptedCallback?(): void;
    disconnectedCallback?(): void;
    visibleRoot?: Element;
    props: Props<P>;
    defaultSlot: VNodeChildElement[];
    emit(event: string, detail: any, options: EventInit): boolean;
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

        attributeChangedCallback(name: string, _: string, value: string) {
            try {
                value = JSON.parse(value);
            } catch {
                /**/
            }

            this.commit(toCamelCase(name) as keyof P, value);
        }

        private root: DocumentFragment | Element;
        private CSS?: VNode;
        private vTree: VNodeChildElement | VNodeChildElement[];
        private tick?: Promise<any>;

        readonly props: Props<P> = {} as Props<P>;

        @watch
        defaultSlot: VNodeChildElement[] = [];

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

            if (CSS)
                if (renderChildren)
                    console.warn(
                        '[WebCell] Global CSS should be used while "renderTarget" is "children"'
                    );
                else this.CSS = <style>{CSS}</style>;
        }

        connectedCallback() {
            this.update();
        }

        render(): VNodeChildElement | undefined {
            return;
        }

        protected update() {
            this.vTree = render(
                <Fragment>
                    {this.CSS}
                    {this.render()}
                </Fragment>,
                this.root,
                this.vTree
            );
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

        toString() {
            return new XMLSerializer()
                .serializeToString(this.root)
                .replace(' xmlns="http://www.w3.org/1999/xhtml"', '');
        }
    }

    return WebCell;
}
