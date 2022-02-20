import { HTMLProps, SVGProps } from 'web-utility';
import { Key, VNode, JsxVNodeChildren, Fragment } from 'snabbdom';

import { ComponentMeta } from '../decorator';
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
    VDOMContainer & {
        is?: ComponentMeta['tagName'];
    };

export type FunctionComponent<P extends WebCellProps = WebCellProps> = (
    props: P
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
} & {
    [tagName: string]: WebCellProps;
};

type SVGTags = {
    [tagName in keyof SVGElementTagNameMap]: VDOMContainer &
        SVGProps<SVGElementTagNameMap[tagName]> &
        VDOMExtra<SVGElementTagNameMap[tagName]>;
};

declare global {
    namespace JSX {
        // @ts-ignore
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
