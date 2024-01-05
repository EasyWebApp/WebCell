import { DOMRenderer, DataObject, VNode } from 'dom-renderer';
import { autorun } from 'mobx';
import {
    CustomElement,
    isHTMLElementClass,
    parseJSON,
    toCamelCase,
    toHyphenCase
} from 'web-utility';

export interface ComponentMeta
    extends ElementDefinitionOptions,
        Partial<ShadowRootInit> {
    tagName: string;
}

/**
 * `class` decorator of Web components
 */
export function component({ tagName, ...meta }: ComponentMeta) {
    return <T extends CustomElementConstructor>(
        Class: T,
        { addInitializer }: ClassDecoratorContext<CustomElementConstructor>
    ) => {
        class RendererComponent extends (Class as CustomElementConstructor) {
            protected internals = this.attachInternals();
            protected renderer = new DOMRenderer();

            constructor() {
                super();

                if (meta.mode) this.attachShadow(meta as ShadowRootInit);
            }

            connectedCallback() {
                this.update();
                // @ts-ignore
                super.connectedCallback?.();
            }

            update() {
                const vNode = this.render?.(),
                    { shadowRoot } = this.internals;
                // @ts-ignore
                if (vNode) this.renderer.render(vNode, shadowRoot || this);
            }

            declare render: () => VNode;
        }

        addInitializer(function () {
            globalThis.customElements?.define(tagName, this, meta);
        });
        return RendererComponent as unknown as T;
    };
}

export type FunctionComponent<P extends DataObject = {}> = (props: P) => VNode;
export type FC<P extends DataObject = {}> = FunctionComponent<P>;

function wrapFunction<P>(func: FC<P>) {
    return (props: P) => {
        var tree: VNode,
            renderer = new DOMRenderer();

        const disposer = autorun(() => {
            const newTree = func(props);

            tree = tree ? renderer.patch(tree, newTree) : newTree;
        });
        const { unRef } = tree;

        tree.unRef = node => (disposer(), unRef?.(node));

        return tree;
    };
}

export type ClassComponent = CustomElementConstructor;

function wrapClass<T extends ClassComponent>(Class: T) {
    class ObserverComponent
        extends (Class as ClassComponent)
        implements CustomElement
    {
        protected disposers = [];

        constructor() {
            super();

            const { update } = Object.getPrototypeOf(this);
            // @ts-ignore
            this.update = () =>
                this.disposers.push(autorun(() => update.call(this)));

            const names: string[] = this.constructor['observedAttributes'];

            this.disposers.push(
                ...names.map(name => autorun(() => this.syncPropAttr(name)))
            );
        }

        disconnectedCallback() {
            for (const disposer of this.disposers) disposer();

            this.disposers.length = 0;
        }

        attributeChangedCallback(name: string, old: string, value: string) {
            this[toCamelCase(name)] = parseJSON(value);

            super['attributeChangedCallback']?.(name, old, value);
        }

        syncPropAttr(name: string) {
            const value = this[toCamelCase(name)];

            if (value != null && value !== false)
                super.setAttribute(
                    name,
                    value === true
                        ? name
                        : typeof value !== 'object'
                          ? value
                          : JSON.stringify(value)
                );
            else this.removeAttribute(name);
        }
    }
    return ObserverComponent as unknown as T;
}

export type WebCellComponent = FunctionComponent | ClassComponent;

/**
 * `class` decorator of Web components for MobX
 */
export function observer<T extends WebCellComponent>(
    func: T,
    _: ClassDecoratorContext
): T;
export function observer<T extends WebCellComponent>(func: T): T;
export function observer<T extends WebCellComponent>(
    func: T,
    _?: ClassDecoratorContext
) {
    return isHTMLElementClass(func) ? wrapClass(func) : wrapFunction(func);
}

/**
 * `accessor` decorator of MobX `@observable` for HTML attributes
 */
export function attribute<C extends CustomElementConstructor, V>(
    _: ClassAccessorDecoratorTarget<C, V>,
    { name, addInitializer }: ClassAccessorDecoratorContext<CustomElement>
) {
    addInitializer(function () {
        const { constructor } = this;
        var names = constructor['observedAttributes'];

        if (!names) {
            names = [];

            Object.defineProperty(constructor, 'observedAttributes', {
                configurable: true,
                get: () => names
            });
        }
        names.push(toHyphenCase(name.toString()));
    });
}

declare global {
    namespace JSX {
        interface ElementAttributesProperty {
            // @ts-ignore
            props: {};
        }
    }
}
