import { DOMRenderer, DataObject, VNode, JsxChildren } from 'dom-renderer';
import {
    IReactionDisposer,
    IReactionPublic,
    autorun,
    reaction as watch
} from 'mobx';
import {
    CustomElement,
    isHTMLElementClass,
    parseJSON,
    toCamelCase,
    toHyphenCase
} from 'web-utility';

import { ClassComponent } from './WebCell';
import { getMobxData } from './utility';

export type PropsWithChildren<P extends DataObject = {}> = P & {
    children?: JsxChildren;
};
export type FunctionComponent<P extends DataObject = {}> = (props: P) => VNode;
export type FC<P extends DataObject = {}> = FunctionComponent<P>;

function wrapFunction<P>(func: FC<P>) {
    return (props: P) => {
        const tree = func(props),
            renderer = new DOMRenderer();

        const disposer = autorun(() => {
            const newTree = func(props);

            if (tree.node) Object.assign(tree, renderer.patch(tree, newTree));
        });
        const { ref } = tree;

        tree.ref = node => {
            if (node) tree.node = node;
            else disposer();

            ref?.(node);
        };
        return tree;
    };
}

interface ReactionItem {
    expression: ReactionExpression;
    effect: Function;
}
const reactionMap = new WeakMap<CustomElement, ReactionItem[]>();

function wrapClass<T extends ClassComponent>(Component: T) {
    class ObserverComponent
        extends (Component as ClassComponent)
        implements CustomElement
    {
        static observedAttributes = [];

        protected disposers: IReactionDisposer[] = [];

        get props() {
            return getMobxData(this);
        }

        constructor() {
            super();

            Promise.resolve().then(() => this.#boot());
        }

        update = () => {
            const { update } = Object.getPrototypeOf(this);

            return new Promise<void>(resolve =>
                this.disposers.push(
                    autorun(() => update.call(this).then(resolve))
                )
            );
        };

        #boot() {
            const names: string[] =
                    this.constructor['observedAttributes'] || [],
                reactions = reactionMap.get(this) || [];

            this.disposers.push(
                ...names.map(name => autorun(() => this.syncPropAttr(name))),
                ...reactions.map(({ expression, effect }) =>
                    watch(
                        reaction => expression(this, reaction),
                        effect.bind(this)
                    )
                )
            );
        }

        disconnectedCallback() {
            for (const disposer of this.disposers) disposer();

            this.disposers.length = 0;

            super['disconnectedCallback']?.();
        }

        setAttribute(name: string, value: string) {
            const old = super.getAttribute(name),
                names: string[] = this.constructor['observedAttributes'];

            super.setAttribute(name, value);

            if (names.includes(name))
                this.attributeChangedCallback(name, old, value);
        }

        attributeChangedCallback(name: string, old: string, value: string) {
            this[toCamelCase(name)] = parseJSON(value);

            super['attributeChangedCallback']?.(name, old, value);
        }

        syncPropAttr(name: string) {
            var value = this[toCamelCase(name)];

            if (!(value != null) || value === false)
                return this.removeAttribute(name);

            value = value === true ? name : value;

            if (typeof value === 'object') {
                value = value.toJSON?.();

                value =
                    typeof value === 'object' ? JSON.stringify(value) : value;
            }
            super.setAttribute(name, value);
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
export function attribute<C extends HTMLElement, V>(
    _: ClassAccessorDecoratorTarget<C, V>,
    { name, addInitializer }: ClassAccessorDecoratorContext<C>
) {
    addInitializer(function () {
        const names: string[] = this.constructor['observedAttributes'],
            attribute = toHyphenCase(name.toString());

        if (!names.includes(attribute)) names.push(attribute);
    });
}

export type ReactionExpression<I = any, O = any> = (
    data?: I,
    reaction?: IReactionPublic
) => O;

export type ReactionEffect<V> = (
    newValue: V,
    oldValue: V,
    reaction: IReactionPublic
) => any;

/**
 * Method decorator of MobX `reaction()`
 */
export function reaction<C extends HTMLElement, V>(
    expression: ReactionExpression<C, V>
) {
    return (
        effect: ReactionEffect<V>,
        { addInitializer }: ClassMethodDecoratorContext<C>
    ) =>
        addInitializer(function () {
            const reactions = reactionMap.get(this) || [];

            reactions.push({ expression, effect });

            reactionMap.set(this, reactions);
        });
}
