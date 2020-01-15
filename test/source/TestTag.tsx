import {
    createCell,
    component,
    mixin,
    attribute,
    watch,
    on,
    Fragment
} from '../../source';

import { SubTag } from './SubTag';

interface Props {
    title?: string;
}

interface State {
    status: string;
}

@component({
    tagName: 'test-tag',
    style: {
        '.title': {
            color: 'lightblue'
        },
        '.title.active': {
            color: 'lightpink'
        }
    }
})
export class TestTag extends mixin<Props, State>() {
    @attribute
    @watch
    title = 'Test';

    state = { status: '' };

    onClick = () => (this.title = 'Example');

    @on('click', ':host h1')
    onDelegate() {
        this.setState({ status: 'active' });
    }

    render({ title }: Props, { status }: State) {
        return (
            <Fragment>
                <h1 title={title} className={`title ${status}`}>
                    {title}
                    <img alt={title} onClick={this.onClick} />

                    <SubTag />
                </h1>
            </Fragment>
        );
    }
}
