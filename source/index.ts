import { DOMRenderer, VNode } from 'dom-renderer';
import { autorun } from 'mobx';

interface ComponentMeta extends ElementDefinitionOptions {
    tagName: string;
}

export function component({ tagName, ...meta }: ComponentMeta) {
    return <T extends CustomElementConstructor>(
        Class: T,
        { addInitializer }: ClassDecoratorContext
    ) => {
        class RendererComponent extends (Class as CustomElementConstructor) {
            protected renderer = new DOMRenderer();

            connectedCallback() {
                this.update();
                // @ts-ignore
                super.connectedCallback?.();
            }

            update() {
                const vNode = this.render?.();

                if (vNode) this.renderer.render(vNode, this);
            }

            declare render: () => VNode;
        }

        addInitializer(function (this: CustomElementConstructor) {
            globalThis.customElements?.define(tagName, this, meta);
        });
        return RendererComponent as unknown as T;
    };
}

export function observer<T extends CustomElementConstructor>(
    Class: T,
    _: ClassDecoratorContext
) {
    class ObserverComponent extends (Class as CustomElementConstructor) {
        constructor() {
            super();

            const { update } = Object.getPrototypeOf(this);
            // @ts-ignore
            this.update = () => autorun(() => update.call(this));
        }
    }
    return ObserverComponent as unknown as T;
}
