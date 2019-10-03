import * as WebCell from '../../source';

export function InlineTag({ children }: any) {
    return <span>{children}</span>;
}

@WebCell.component({
    tagName: 'sub-tag',
    renderTarget: 'children'
})
export class SubTag extends WebCell.mixin() {
    render() {
        return <InlineTag>test</InlineTag>;
    }
}
