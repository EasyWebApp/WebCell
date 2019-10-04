import { createCell, component, mixin } from '../../source';

export function InlineTag({ children }: any) {
    return <span>{children}</span>;
}

@component({
    tagName: 'sub-tag',
    renderTarget: 'children'
})
export class SubTag extends mixin() {
    render() {
        return <InlineTag>test</InlineTag>;
    }
}
