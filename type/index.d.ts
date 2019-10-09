declare namespace JSX {
    interface IntrinsicElements {
        [tagName: string]: any;
    }
    interface ElementAttributesProperty {
        props: any;
    }
    interface ElementChildrenAttribute {
        children: any;
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
