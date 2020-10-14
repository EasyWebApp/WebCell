import { HTMLProps } from 'web-utility/source/DOM-type';
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

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [tagName: string]: WebCellProps;
        }
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
