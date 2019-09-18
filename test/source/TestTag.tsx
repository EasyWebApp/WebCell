import * as WebCell from '../../source';

import { SubTag } from './SubTag';

@WebCell.component({
    tagName: 'test-tag'
})
export default class TestTag extends WebCell.mixin() {
    onClick = ({ target }) => target.remove();

    render() {
        return (
            <h1 title="Test" class="title">
                Test
                <img alt="Test" onclick={this.onClick} />
                <SubTag />
            </h1>
        );
    }
}
