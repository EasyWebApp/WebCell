import { Constructor } from 'web-utility/source/data';
import { CustomElement } from 'web-utility/source/DOM-type';
import {
    WebCellProps,
    WebCellElement,
    delegate,
    Fragment,
    toHyphenCase,
    toCamelCase
} from './utility';
import { ComponentMeta, watch, DOMEventDelegater } from './decorator';
import { VNodeChildElement, VNode, createCell, render } from './renderer';

export type WebCellFunction<P extends WebCellProps = WebCellProps> = (
    props?: P
) => WebCellElement;

export interface WebCellComponent<P extends WebCellProps = WebCellProps, S = {}>
    extends CustomElement {
    root: DocumentFragment | Element;
    update(): void;
    props: P;
    setProps(data: Partial<P>): Promise<any>;
    state: S;
    setState(data: Partial<S>): Promise<void>;
    defaultSlot: VNodeChildElement[];
    render(props: P, state: S): WebCellElement;
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

export interface WebCellClass<P extends WebCellProps = WebCellProps, S = {}>
    extends Partial<ComponentMeta>,
        Constructor<WebCellComponent<P, S>> {
    attributes?: string[];
    eventDelegaters?: DOMEventDelegater[];
}

export function mixin<P extends WebCellProps = WebCellProps, S = {}>(
    superClass: Constructor<HTMLElement> = HTMLElement
): WebCellClass<P, S> {
    class WebCell extends superClass implements WebCellComponent<P, S> {
        static tagName: string;
        static extends?: string;
        static renderTarget: ComponentMeta['renderTarget'] = 'shadowRoot';
        static style?: ComponentMeta['style'];
        static attributes: string[] = [];
        static eventDelegaters: DOMEventDelegater[] = [];

        readonly root: DocumentFragment | Element;
        private CSS?: VNode;
        private vTree: WebCellElement;
        private tick?: Promise<void>;

        readonly props: P = {} as P;
        readonly state: S = {} as S;
        private cache: Partial<S> = {} as Partial<S>;

        @watch
        defaultSlot: VNodeChildElement[] = [];

        [key: string]: any;

        constructor({ mode = 'open' }: ShadowRootInit = {} as ShadowRootInit) {
            super();

            const { renderTarget, eventDelegaters, style } = this
                .constructor as WebCellClass<P, S>;

            const renderChildren = renderTarget === 'children';

            const root = (this.root = renderChildren
                ? this
                : this.attachShadow({ mode }));

            for (const { type, selector, method } of eventDelegaters) {
                if (renderChildren && /^:host/.test(selector))
                    console.warn(
                        `[WebCell] DOM Event delegation of "${selector}" won't work if you don't invoke "this.attachShadow()" manually.`
                    );

                root.addEventListener(
                    type,
                    delegate(selector, this[method]).bind(this)
                );
            }

            if (style)
                if (renderChildren)
                    console.warn(
                        '[WebCell] Global CSS should be used while "renderTarget" is "children"'
                    );
                else this.CSS = <style>{style as string}</style>;
        }

        connectedCallback() {
            this.update();
        }

        render(props: P, state: S) {
            return (this.constructor as WebCellClass<P, S>).renderTarget !==
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
            this.cache = {} as Partial<S>;

            this.vTree = render(
                <>
                    {this.CSS}
                    {this.render(this.props, this.state)}
                </>,
                this.root,
                this.vTree
            );

            this.updatedCallback?.();
        }

        protected updateAsync() {
            return (this.tick =
                this.tick ||
                new Promise<void>(resolve =>
                    self.requestAnimationFrame(() => {
                        this.update();

                        this.tick = undefined;
                        resolve();
                    })
                ));
        }

        private syncPropAttr(data: Partial<P>, list: string[]) {
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

        setProps(data: Partial<P>) {
            Object.assign(this.props, data);

            const { attributes } = this.constructor as WebCellClass<P, S>;

            if (attributes)
                var attributesChanged = new Promise<void>(resolve =>
                    self.requestAnimationFrame(
                        () => (this.syncPropAttr(data, attributes), resolve())
                    )
                );

            return Promise.all([attributesChanged, this.updateAsync()]);
        }

        setState(data: Partial<S>) {
            Object.assign(this.cache, data);

            return this.updateAsync();
        }

        setAttribute(name: string, value: string) {
            super.setAttribute(name, value);

            const { attributes } = this.constructor as WebCellClass<P, S>;

            if (!attributes.includes(name)) return;

            if (typeof value === 'string')
                try {
                    var data = JSON.parse(value);
                } catch (error) {
                    //
                }
            this.setProps({ [toCamelCase(name)]: data ?? value } as Partial<P>);
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
