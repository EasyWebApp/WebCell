import {
    Reflect,
    delegate,
    Fragment,
    toHyphenCase,
    toCamelCase
} from './utility';
import { watch, DOMEventDelegateHandler } from './decorator';
import { VNodeChildElement, VNode, createCell, render } from './renderer';

interface BaseProps {
    defaultSlot?: VNodeChildElement | VNodeChildElement[];
}

type Data<T> = {
    [K in keyof T]: T[K];
};

export interface WebCellComponent<P extends BaseProps = {}, S = {}>
    extends HTMLElement {
    /**
     * Called every time the element is inserted into the DOM
     */
    connectedCallback?(): void;
    /**
     * Called every time the element is removed from the DOM.
     */
    disconnectedCallback?(): void;
    /**
     * Called when an observed attribute has been added, removed, updated, or replaced.
     * Also called for initial values when an element is created by the parser, or upgraded.
     *
     * Note: only attributes listed in static `observedAttributes` property will receive this callback.
     */
    attributeChangedCallback?(
        name: string,
        oldValue: string,
        newValue: string
    ): void;
    /**
     * The custom element has been moved into a new document
     * (e.g. someone called `document.adoptNode(el)`).
     */
    adoptedCallback?(): void;
    update(): void;
    props: Data<P>;
    setProps(data: { [key in keyof P]?: any }): Promise<any>;
    state: Data<S>;
    setState(data: { [key in keyof S]?: any }): Promise<void>;
    defaultSlot: VNodeChildElement[];
    render(
        props: Data<P>,
        state: Data<S>
    ): VNodeChildElement | VNodeChildElement[];
    /**
     * Called before `state` is updated
     */
    shouldUpdate?(oldState: S, newState: S): boolean;
    /**
     * Called after rendering
     */
    updatedCallback?(): void;
    emit(event: string, detail?: any, options?: EventInit): boolean;
    toString(): string;
}

export function mixin<P = {}, S = {}>(
    superClass = HTMLElement
): { new (): WebCellComponent<P, S> } {
    class WebCell extends superClass implements WebCellComponent<P, S> {
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

        constructor({ mode = 'open' }: ShadowRootInit = {} as ShadowRootInit) {
            super();

            const renderChildren =
                Reflect.getMetadata('renderTarget', this.constructor) ===
                'children';

            const root = (this.root = renderChildren
                ? this
                : this.attachShadow({ mode }));

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

        render(props: Data<P>, state: Data<S>) {
            return Reflect.getMetadata('renderTarget', this.constructor) !==
                'children' ? (
                <slot />
            ) : (
                this.defaultSlot
            );
        }

        update() {
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

        private syncPropAttr(data: { [key in keyof P]?: any }, list: string[]) {
            for (const key in data) {
                const name = toHyphenCase(key);

                if (!list.includes(name)) continue;

                const item = data[key];

                if (item != null && item !== false) {
                    if (typeof item !== 'object')
                        super.setAttribute(name, item === true ? name : item);
                } else this.removeAttribute(name);
            }
        }

        setProps(data: { [key in keyof P]?: any }) {
            Object.assign(this.props, data);

            const attributes: string[] | null = Reflect.getMetadata(
                'attributes',
                this.constructor
            );

            if (attributes)
                var attributesChanged = new Promise(resolve =>
                    self.requestAnimationFrame(
                        () => (this.syncPropAttr(data, attributes), resolve())
                    )
                );

            return Promise.all([attributesChanged, this.updateAsync()]);
        }

        setState(data: { [key in keyof S]?: any }) {
            Object.assign(this.cache, data);

            return this.updateAsync();
        }

        setAttribute(name: string, value: string | number | boolean) {
            super.setAttribute(name, value);

            const list: string[] | null = Reflect.getMetadata(
                'attributes',
                this.constructor
            );

            if (!list?.includes(name)) return;

            if (typeof value === 'string')
                try {
                    var data = JSON.parse(value);
                } catch (error) {
                    //
                }

            this.setProps({ [toCamelCase(name)]: data ?? value } as {
                [key in keyof P]?: any;
            });
        }

        emit(
            event: string,
            detail?: any,
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
                .replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '');
        }
    }

    return WebCell;
}
