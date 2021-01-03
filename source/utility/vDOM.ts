import type {
    SelfCloseTags,
    HTMLContentKeys,
    BaseHTMLProps,
    BaseSVGProps,
    HTMLProps,
    BaseEventHandlers,
    InputEventHandlers,
    BubbleEventHandlers
} from 'web-utility';
import { VNodeChildElement } from 'snabbdom/build/package/h';
import { WebCellComponent } from '../WebCell';

export interface WebCellData extends HTMLProps {
    key?: string | number;
    ref?: (node: Node) => void;
}

export type WebCellElement = VNodeChildElement | VNodeChildElement[];

export interface WebCellProps extends WebCellData {
    defaultSlot?: WebCellElement;
}

type BaseCellProps<T extends HTMLElement> = WebCellProps &
    BaseEventHandlers &
    Omit<BaseHTMLProps<T>, 'style' | HTMLContentKeys>;
type HTMLTags = {
    [tagName in keyof HTMLElementTagNameMap]: BaseCellProps<
        HTMLElementTagNameMap[tagName]
    > &
        (tagName extends 'input'
            ? InputEventHandlers
            : tagName extends SelfCloseTags
            ? {}
            : BubbleEventHandlers);
};

type SVGScalar<T extends Partial<SVGElement>> = {
    [K in keyof T]?: T[K] extends SVGAnimatedLength
        ? number
        : T[K] extends SVGAnimatedRect
        ? string
        : T[K];
};
type SVGTags = {
    [tagName in keyof SVGElementTagNameMap]: WebCellProps &
        SVGScalar<Omit<BaseSVGProps<SVGElementTagNameMap[tagName]>, 'style'>>;
};

declare global {
    namespace JSX {
        interface IntrinsicElements
            extends HTMLTags,
                Omit<SVGTags, 'a' | 'script' | 'style' | 'title'> {}

        interface ElementAttributesProperty {
            props: WebCellProps;
        }
        interface ElementChildrenAttribute {
            defaultSlot: VNodeChildElement[];
        }
        interface ElementClass extends WebCellComponent<any, any> {}
    }
}

export function Fragment({ defaultSlot }: WebCellProps) {
    return defaultSlot;
}
