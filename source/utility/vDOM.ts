import { HTMLProps } from 'web-utility/source/DOM-type';
import { VNodeChildElement } from 'snabbdom/src/h';

export interface CellData extends HTMLProps {
    key?: string | number;
    ref?: (node: Node) => void;
}

export interface WebCellProps extends CellData {
    defaultSlot?: VNodeChildElement | VNodeChildElement[];
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [tagName: string]: WebCellProps;
        }
        interface ElementAttributesProperty {
            props: WebCellProps;
        }
        interface ElementChildrenAttribute extends WebCellProps {}

        interface ElementClass {
            render: (
                props: WebCellProps,
                state: Record<string, any>
            ) => VNodeChildElement | VNodeChildElement[];
        }
    }
}

export function Fragment({ defaultSlot }: WebCellProps) {
    return defaultSlot;
}
