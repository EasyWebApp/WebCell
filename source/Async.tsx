import { observable } from 'mobx';

import { ComponentTag, WebCellProps, FunctionComponent } from './utility';
import { WebCellClass, WebCell } from './WebCell';
import { component, observer, reaction } from './decorator';
import { createCell } from './renderer';

export interface AsyncBoxProps extends WebCellProps {
    loader: () => Promise<ComponentTag>;
    delegatedProps?: WebCellProps;
}

@component({
    tagName: 'async-box'
})
@observer
export class AsyncBox extends WebCell<AsyncBoxProps>() {
    @observable
    loader: AsyncBoxProps['loader'];

    @observable
    component?: ComponentTag;

    @observable
    delegatedProps?: AsyncBoxProps['delegatedProps'];

    connectedCallback() {
        super.connectedCallback();

        this.load();
    }

    @reaction((element: AsyncBox) => element.loader)
    protected async load() {
        this.component = undefined;
        this.component = await this.loader();

        this.emit('load', this.component);
    }

    render() {
        const { component: Tag, props, delegatedProps } = this;
        const { defaultSlot, ...data } = { ...props, ...delegatedProps };

        return Tag && <Tag {...data}>{defaultSlot}</Tag>;
    }
}

type GetAsyncProps<T> = T extends () => Promise<{
    default: FunctionComponent<infer P> | WebCellClass<infer P>;
}>
    ? P
    : {};

export function lazy<
    T extends () => Promise<{ default: FunctionComponent | WebCellClass }>
>(loader: T) {
    return (props: GetAsyncProps<T>) => (
        <AsyncBox
            delegatedProps={props}
            loader={async () => (await loader()).default}
        />
    );
}
