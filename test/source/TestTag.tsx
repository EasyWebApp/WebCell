import * as WebCell from '../../source';

@WebCell.component({
    tagName: 'test-tag'
})
export default class TestTag extends WebCell.mixin() {
    render() {
        return (
            <h1 title="Test" class="title">
                Test
                <img alt="Test" />
            </h1>
        );
    }
}
