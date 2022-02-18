import type {} from 'element-internals-polyfill';
import { ElementInternals } from 'element-internals-polyfill/dist/element-internals';
import {
    Constructor,
    CustomElement,
    CustomElementClass,
    delegate,
    stringifyDOM,
    toCamelCase
} from 'web-utility';
import { IReactionDisposer, observable } from 'mobx';

import { WebCellProps } from './utility';
import { ComponentMeta, DOMEventDelegater } from './decorator';
import { Fragment, createCell, render } from './renderer';

export interface WebCellComponent<P extends WebCellProps = WebCellProps>
    extends CustomElement {
    internals?: ElementInternals;
    root?: DocumentFragment | HTMLElement;
    update?(): void;
    /**
     * @deprecated Get values from `this` directly since WebCell 3.0.0
     */
    props?: P;
    disposers?: IReactionDisposer[];
    syncPropAttr?(name: string): void;
    defaultSlot?: JSX.Element;
    render?(): JSX.Element;
    /**
     * Called after rendering
     */
    updatedCallback?(): void;
    emit?(event: string, detail?: any, options?: EventInit): boolean;
    toString(): string;
}

export interface WebCellClass<P extends WebCellProps = WebCellProps>
    extends Pick<CustomElementClass, 'observedAttributes'>,
        Partial<ComponentMeta>,
        Constructor<WebCellComponent<P>> {
    eventDelegaters?: DOMEventDelegater[];
}

export function WebCell<P extends WebCellProps = WebCellProps>(
    superClass: Constructor<CustomElement> = HTMLElement
): WebCellClass<P> {
    class WebCell extends superClass implements WebCellComponent<P> {
        static tagName: ComponentMeta['tagName'];
        static extends?: ComponentMeta['extends'];
        static mode?: ComponentMeta['mode'];
        static delegatesFocus?: ComponentMeta['delegatesFocus'];
        static eventDelegaters: DOMEventDelegater[] = [];

        readonly internals?: ElementInternals;
        readonly root: DocumentFragment | HTMLElement;
        readonly props: P = {} as P;
        readonly disposers: IReactionDisposer[] = [];

        @observable
        defaultSlot = (<></>);

        [key: string]: any;

        constructor() {
            super();

            const {
                extends: extendTag,
                mode,
                delegatesFocus,
                eventDelegaters
            } = this.constructor as WebCellClass;

            const renderChildren = !(mode != null);

            if (!extendTag) this.internals = this.attachInternals();

            this.root = renderChildren
                ? this
                : this.internals?.shadowRoot ||
                  this.attachShadow({ mode, delegatesFocus });

            for (const { selector, method } of eventDelegaters) {
                if (renderChildren && /^:host/.test(selector))
                    console.warn(
                        `[WebCell] DOM Event delegation of "${selector}" won't work if you don't invoke "this.attachShadow()" manually.`
                    );
                this[method] = delegate(selector, this[method]).bind(this);
            }
        }

        connectedCallback() {
            const { eventDelegaters } = this.constructor as WebCellClass,
                { root } = this;

            for (const { type, method } of eventDelegaters)
                root.addEventListener(type, this[method]);

            if (!(root instanceof DocumentFragment) || !root.lastChild)
                this.update();
        }

        render() {
            return (this.constructor as WebCellClass).mode != null ? (
                <slot />
            ) : (
                this.defaultSlot
            );
        }

        update() {
            render(this.render(), this.root);

            this.updatedCallback?.();
        }

        disconnectedCallback() {
            const { eventDelegaters } = this.constructor as WebCellClass;

            for (const { type, method } of eventDelegaters)
                this.root.removeEventListener(type, this[method]);

            for (const disposer of this.disposers) disposer();
        }

        syncPropAttr(name: string) {
            const value = this[toCamelCase(name)];

            if (value != null && value !== false) {
                if (typeof value !== 'object')
                    super.setAttribute(name, value === true ? name : value);
            } else this.removeAttribute(name);
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
            return stringifyDOM(this.root);
        }
    }

    return WebCell;
}

export type ComponentClass = {
    new (): InstanceType<ReturnType<typeof WebCell>>;
};
