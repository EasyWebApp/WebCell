import {
    toCamelCase,
    toHyphenCase,
    parseJSON,
    isHTMLElementClass,
    DelegateEventHandler
} from 'web-utility';
import { IReactionPublic, reaction as watch, autorun } from 'mobx';

import { FunctionComponent } from './utility/vDOM';
import { WebCellComponent, WebCellClass, ComponentClass } from './WebCell';
import { VNode } from 'snabbdom';
import { patch } from './renderer';

export interface ComponentMeta extends Partial<ShadowRootInit> {
    tagName: `${string}-${string}`;
    extends?: keyof HTMLElementTagNameMap;
}

export function component(meta: ComponentMeta) {
    return <T extends WebCellClass>(Class: T) => {
        customElements.define(meta.tagName, Object.assign(Class, meta), {
            extends: meta.extends
        });
        return Class;
    };
}

function wrapFunction<P>(func: FunctionComponent<P>) {
    return function (props?: P) {
        var tree: VNode;

        const disposer = autorun(
            () => (tree = tree ? patch(tree, func(props)) : func(props))
        );
        const { destroy } = (tree.data ||= {}).hook || {};

        tree.data.hook = {
            ...tree.data.hook,
            destroy(node) {
                disposer();
                destroy?.(node);
            }
        };
        return tree;
    };
}

function wrapClass<T extends ComponentClass>(Component: T) {
    // @ts-ignore
    return class ObserverTrait extends Component {
        connectedCallback() {
            const { observedAttributes = [], reactions } = this
                .constructor as WebCellClass;

            this.disposers.push(
                autorun(() => this.update()),

                ...observedAttributes.map(name =>
                    autorun(() => this.syncPropAttr(name))
                ),
                ...reactions.map(({ methodKey, expression }) =>
                    watch(
                        r => expression(this, r),
                        (this[methodKey] as ReactionHandler).bind(this)
                    )
                )
            );
            super.connectedCallback?.();
        }

        attributeChangedCallback(name: string, old: string, value: string) {
            this[toCamelCase(name)] = parseJSON(value);

            super.attributeChangedCallback?.(name, old, value);
        }
    };
}

export function observer<T extends FunctionComponent | ComponentClass>(
    Component: T
): any {
    return isHTMLElementClass(Component)
        ? wrapClass(Component)
        : wrapFunction(Component);
}

export function attribute<T extends InstanceType<WebCellClass>>(
    { constructor }: T,
    key: string
) {
    var { observedAttributes } = constructor as WebCellClass;

    if (!observedAttributes) {
        observedAttributes = [];

        Object.defineProperty(constructor, 'observedAttributes', {
            configurable: true,
            get: () => observedAttributes
        });
    }
    observedAttributes.push(toHyphenCase(key));
}

type ReactionHandler<I = any, O = any> = (
    data?: I,
    reaction?: IReactionPublic
) => O;

export interface ReactionDelegater {
    methodKey: string;
    expression: ReactionHandler;
}

export function reaction<C extends WebCellComponent, V>(
    expression: ReactionHandler<C, V>
) {
    return (
        { constructor }: C,
        key: string,
        meta: TypedPropertyDescriptor<ReactionHandler<V>>
    ) => {
        (constructor as WebCellClass).reactions.push({
            methodKey: key,
            expression
        });
        return meta;
    };
}

export interface DOMEventDelegater {
    type: keyof HTMLElementEventMap;
    selector: string;
    method: string;
}

export function on(type: DOMEventDelegater['type'], selector: string) {
    return <
        T extends DelegateEventHandler,
        I extends InstanceType<WebCellClass>
    >(
        { constructor }: I,
        method: string,
        meta: PropertyDescriptor
    ) => {
        (constructor as WebCellClass).eventDelegaters.push({
            type,
            selector,
            method
        });
        return meta as PropertyDescriptor & { value: T };
    };
}
