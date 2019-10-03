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

    @WebCell.watch
    status = '';

    onClick = () => (this.title = 'Example');

    @WebCell.on('click', ':host h1')
    onDelegate() {
        this.status = 'active';
    }

    render() {
        return (
            <h1 title={this.title} className={`title ${this.status}`}>
                {this.title}
                <img alt={this.title} onClick={this.onClick} />
                <SubTag />
            </h1>
        );
    }
}
