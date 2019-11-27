declare namespace JSX {
    interface IntrinsicElements {
        [tagName: string]: any;
    }
    interface ElementAttributesProperty {
        props: any;
    }
    interface ElementChildrenAttribute {
        defaultSlot: any;
    }
    interface ElementClass {
        render: any;
    }
}
