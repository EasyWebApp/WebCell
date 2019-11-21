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

declare module '*.css' {
    const content: string;

    export default content;
}

declare module '*.json' {
    const content: any;

    export default content;
}
