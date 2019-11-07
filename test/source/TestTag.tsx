import {
    createCell,
    component,
    mixin,
    attribute,
    watch,
    on,
    Fragment
} from '../../source';

import style from './TestTag.css';
import { SubTag } from './SubTag';

@component({
    tagName: 'test-tag',
    style
})
export default class TestTag extends mixin() {
    @attribute
    @watch
    title = 'Test';

    @watch
    status = '';

    onClick = () => (this.title = 'Example');

    @on('click', ':host h1')
    onDelegate() {
        this.status = 'active';
    }

    render() {
        return (
            <h1 title={this.title} className={`title ${this.status}`}>
                <Fragment>
                    {this.title}
                    <img alt={this.title} onClick={this.onClick} />
                </Fragment>
                <SubTag />
            </h1>
        );
    }
}
