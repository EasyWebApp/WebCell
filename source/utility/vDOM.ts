import { VNodeChildElement } from 'snabbdom/src/h';

export interface WebCellProps {
    defaultSlot?: VNodeChildElement[];
}

export function Fragment({ defaultSlot }: WebCellProps) {
    return defaultSlot;
}
