import { DOMRenderer, VNode } from 'dom-renderer';
import {
    CustomElement,
    DelegateEventHandler,
    delegate,
    stringifyDOM
} from 'web-utility';

export interface ComponentMeta
    extends ElementDefinitionOptions,
        Partial<ShadowRootInit> {
    tagName: string;
}

export type ComponentClass = CustomElementConstructor;

interface DelegatedEvent {
    type: keyof HTMLElementEventMap;
    selector: string;
    handler: EventListener;
}
const eventMap = new WeakMap<CustomElement, DelegatedEvent[]>();

/**
 * `class` decorator of Web components
 */
export function component(meta: ComponentMeta) {
    return <T extends ComponentClass>(
        Class: T,
        { addInitializer }: ClassDecoratorContext<ComponentClass>
    ) => {
        class RendererComponent
            extends (Class as ComponentClass)
            implements CustomElement
        {
            protected internals = this.attachInternals();
            protected renderer = new DOMRenderer();

            get root() {
                return this.internals.shadowRoot || this;
            }

            constructor() {
                super();

                if (meta.mode && !this.internals.shadowRoot)
                    this.attachShadow(meta as ShadowRootInit);
            }

            connectedCallback() {
                this.update();

                const { mode } = meta;
                const renderChildren = !(mode != null);

                const { root } = this,
                    events = eventMap.get(this) || [];

                for (const { type, selector, handler } of events) {
                    if (renderChildren && /^:host/.test(selector))
                        console.warn(
                            `[WebCell] DOM Event delegation of "${selector}" won't work if you don't invoke "this.attachShadow()" manually.`
                        );
                    root.addEventListener(type, handler);
                }

                super['connectedCallback']?.();
            }

            declare render: () => VNode;

            update() {
                const vNode = this.render?.();

                if (vNode) this.renderer.render(vNode, this.root);
            }

            disconnectedCallback() {
                const { root } = this,
                    events = eventMap.get(this) || [];

                for (const { type, handler } of events)
                    root.removeEventListener(type, handler);

                super['disconnectedCallback']?.();
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

        addInitializer(function () {
            globalThis.customElements?.define(meta.tagName, this, meta);
        });
        return RendererComponent as unknown as T;
    };
}

/**
 * Method decorator of DOM Event delegation
 */
export function on<T extends HTMLElement>(
    type: DelegatedEvent['type'],
    selector: string
) {
    return (
        method: DelegateEventHandler,
        { addInitializer }: ClassMethodDecoratorContext<T>
    ) =>
        addInitializer(function () {
            const events = eventMap.get(this) || [],
                handler = delegate(selector, method.bind(this));

            events.push({ type, selector, handler });

            eventMap.set(this, events);
        });
}
