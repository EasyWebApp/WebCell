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
export class TestTag extends mixin<{ title?: string }, { status: string }>() {
    @attribute
    @watch
    title = 'Test';

    state = { status: '' };

    onClick = () => (this.title = 'Example');

    @on('click', ':host h1')
    onDelegate() {
        this.setState({ status: 'active' });
    }

    render() {
        const { status } = this.state;

        return (
            <Fragment>
                <h1 title={this.title} className={`title ${status}`} i18n>
                    {this.title}
                    <img alt={this.title} onClick={this.onClick} />

                    <SubTag />
                </h1>
            </Fragment>
        );
    }
}
