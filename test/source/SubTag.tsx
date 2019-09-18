import * as WebCell from '../../source';

export function InlineTag() {
    return <span />;
}

@WebCell.component({
    tagName: 'sub-tag'
})
export class SubTag extends WebCell.mixin() {
    render() {
        return (
            <div>
                <InlineTag />
            </div>
        );
    }
}
