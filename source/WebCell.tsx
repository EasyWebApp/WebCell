import { DOMRenderer, JsxProps, VNode } from 'dom-renderer';
import {
    CustomElement,
    DelegateEventHandler,
    delegate,
    isEmpty,
    stringifyDOM
} from 'web-utility';

export interface ComponentMeta
    extends ElementDefinitionOptions,
        Partial<ShadowRootInit> {
    tagName: string;
}

export type ClassComponent = CustomElementConstructor;

export type WebCellProps<T extends HTMLElement = HTMLElement> = JsxProps<T>;

export interface WebCell<P = {}> extends CustomElement {
    props: P & WebCellProps;
    internals: ElementInternals;
    renderer: DOMRenderer;
    root: ParentNode;
    mounted: boolean;
    update: () => void;
    /**
     * Called at DOM tree updated
     */
    updatedCallback?: () => any;
    /**
     * Called at first time of DOM tree updated
     */
    mountedCallback?: () => any;
    emit: (event: string, detail?: any, option?: EventInit) => boolean;
}

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
    return <T extends ClassComponent>(
        Class: T,
        { addInitializer }: ClassDecoratorContext<ClassComponent>
    ) => {
        class RendererComponent
            extends (Class as ClassComponent)
            implements WebCell
        {
            declare props: WebCellProps;

            internals = this.attachInternals();
            renderer = new DOMRenderer();

            get root(): ParentNode {
                return this.internals.shadowRoot || this;
            }
            mounted = false;
            declare mountedCallback?: () => any;

            constructor() {
                super();

                if (meta.mode && !this.internals.shadowRoot)
                    this.attachShadow(meta as ShadowRootInit);
            }

            connectedCallback() {
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

                if (this.mounted) return;

                this.update();

                this.mounted = true;
                this.mountedCallback?.();
            }

            declare render?: () => VNode;
            declare updatedCallback?: () => any;

            update() {
                const vNode = this.render?.();

                const content = isEmpty(vNode) ? (
                    meta.mode ? (
                        <slot />
                    ) : null
                ) : (
                    vNode
                );

                if (content != null) {
                    this.renderer.render(content, this.root);
                    this.updatedCallback?.();
                }
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
