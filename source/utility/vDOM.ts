import { HTMLProps, SVGProps } from 'web-utility';
import { Key, VNode, JsxVNodeChildren, Fragment } from 'snabbdom';

import { WebCellClass, WebCellComponent } from '../WebCell';

interface VDOMExtra<T extends Element> {
    key?: Key;
    ref?: (node: T) => any;
}
interface VDOMContainer {
    defaultSlot?: JsxVNodeChildren;
}

export type VDOMData<T extends HTMLElement = HTMLElement> = HTMLProps<T> &
    VDOMExtra<T>;

export type WebCellProps<T extends HTMLElement = HTMLElement> = VDOMData<T> &
    VDOMContainer;

export type FunctionComponent<P = {}, T extends HTMLElement = HTMLElement> = (
    props: P & WebCellProps<T>
) => VNode;

export type ComponentTag =
    | string
    | typeof Fragment
    | FunctionComponent
    | WebCellClass;

type HTMLTags = {
    [tagName in keyof HTMLElementTagNameMap]: WebCellProps<
        HTMLElementTagNameMap[tagName]
    >;
};

type SVGTags = {
    [tagName in keyof SVGElementTagNameMap]: VDOMContainer &
        SVGProps<SVGElementTagNameMap[tagName]> &
        VDOMExtra<SVGElementTagNameMap[tagName]>;
};

declare global {
    namespace JSX {
        interface IntrinsicElements
            extends HTMLTags,
                Omit<SVGTags, 'a' | 'script' | 'style' | 'title'> {}

        interface ElementAttributesProperty {
            props: WebCellProps;
        }
        type Element = VNode;

        interface ElementChildrenAttribute {
            defaultSlot: JsxVNodeChildren;
        }
        type ElementClass = WebCellComponent;
    }
}
