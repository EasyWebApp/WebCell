import * as WebCell from '../../source';

import style from './TestTag.css';
import { SubTag } from './SubTag';

@WebCell.component({
    tagName: 'test-tag',
    style
})
export default class TestTag extends WebCell.mixin() {
    @WebCell.attribute
    @WebCell.watch
    title = 'Test';

    onClick = () => (this.title = 'Example');

    render() {
        return (
            <h1 title={this.title} class="title">
                {this.title}
                <img alt={this.title} onclick={this.onClick} />
                <SubTag />
            </h1>
        );
    }
}
