import { DOMRenderer, DataObject, VNode } from 'dom-renderer';
import { autorun } from 'mobx';
import { CustomElement, isHTMLElementClass } from 'web-utility';

export interface ComponentMeta
    extends ElementDefinitionOptions,
        Partial<ShadowRootInit> {
    tagName: string;
}

/**
 * Class decorator of Web components
 */
export function component({ tagName, ...meta }: ComponentMeta) {
    return <T extends CustomElementConstructor>(
        Class: T,
        { addInitializer }: ClassDecoratorContext
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

        addInitializer(function (this: CustomElementConstructor) {
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
        }

        disconnectedCallback() {
            for (const disposer of this.disposers) disposer();
        }
    }
    return ObserverComponent as unknown as T;
}

export type WebCellComponent = FunctionComponent | ClassComponent;

/**
 * Class decorator of Web components for MobX
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

declare global {
    namespace JSX {
        interface ElementAttributesProperty {
            // @ts-ignore
            props: {};
        }
    }
}
