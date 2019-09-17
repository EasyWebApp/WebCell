import * as WebCell from '../../source';

@WebCell.component({
    tagName: 'test-tag'
})
export default class TestTag extends WebCell.mixin() {
    render() {
        return (
            <h1 title="Test">
                Test
                <img />
            </h1>
        );
    }
}
