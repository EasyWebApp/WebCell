import { Reflect, toCamelCase, Fragment, delegate } from './utility';
import { watch, DOMEventDelegateHandler } from './decorator';
import { VNodeChildElement, VNode, createCell, render } from './renderer';

interface BaseProps {
    defaultSlot?: VNodeChildElement | VNodeChildElement[];
}

type Data<T> = {
    [K in keyof T]: T[K];
};

export interface WebCellComponent<P extends BaseProps = {}, S = {}>
    extends Element {
    connectedCallback(): void;
    attributeChangedCallback?(
        name: string,
        oldValue: string,
        newValue: string
    ): void;
    adoptedCallback?(): void;
    disconnectedCallback?(): void;
    props: Data<P>;
    setProps(data: { [key in keyof P]: any }): Promise<void>;
    state: Data<S>;
    setState(data: { [key in keyof S]: any }): Promise<void>;
    defaultSlot: VNodeChildElement[];
    render?(props: Data<P>, state: Data<S>): VNodeChildElement;
    shouldUpdate?(oldState: S, newState: S): boolean;
    updatedCallback?(): void;
    emit(event: string, detail: any, options: EventInit): boolean;
}

export function mixin<P = {}, S = {}>(
    superClass = HTMLElement
): { new (): WebCellComponent<P, S> } {
    class WebCell extends superClass implements WebCellComponent<P, S> {
        static get observedAttributes() {
            return Reflect.getMetadata('attributes', this);
        }

        attributeChangedCallback(name: string, _: string, value: string) {
            try {
                value = JSON.parse(value);
            } catch {
                /**/
            }

            this.setProps({ [toCamelCase(name)]: value } as {
                [key in keyof P]: string;
            });
        }

        private root: DocumentFragment | Element;
        private CSS?: VNode;
        private vTree: VNodeChildElement | VNodeChildElement[];
        private tick?: Promise<any>;

        readonly props: Data<P> = {} as Data<P>;
        readonly state: Data<S> = {} as Data<S>;
        private cache: Data<S> = {} as Data<S>;

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

        protected update() {
            if (
                !(this.CSS || this.render) ||
                !(this.shouldUpdate?.(this.state, this.cache) ?? true)
            )
                return;

            Object.assign(this.state, this.cache);
            this.cache = {} as Data<S>;

            this.vTree = render(
                <Fragment>
                    {this.CSS}
                    {this.render(this.props, this.state)}
                </Fragment>,
                this.root,
                this.vTree
            );

            this.updatedCallback?.();
        }

        protected updateAsync() {
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

        setProps(data: { [key in keyof P]: any }) {
            Object.assign(this.props, data);

            return this.updateAsync();
        }

        setState(data: { [key in keyof S]: any }) {
            Object.assign(this.cache, data);

            return this.updateAsync();
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
