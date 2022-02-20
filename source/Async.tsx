import { observable, reaction } from 'mobx';

import { ComponentTag, WebCellProps, FunctionComponent } from './utility';
import { WebCellClass, WebCell } from './WebCell';
import { component, observer } from './decorator';
import { createCell } from './renderer';

export interface AsyncBoxProps extends WebCellProps {
    loader: () => Promise<ComponentTag>;
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

    get delegatedProps() {
        return Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(this))
                .map(([key, { value }]) => value != null && [key, value])
                .filter(Boolean)
        );
    }
    connectedCallback() {
        if (this.load instanceof Function) this.load();

        this.disposers.push(reaction(() => this.loader, this.load));
    }

    protected load = async () => {
        this.component = undefined;
        this.component = await this.loader();

        this.emit('load', this.component);
    };

    render() {
        const {
            component: Tag,
            props: { defaultSlot, ...props },
            delegatedProps
        } = this;

        return (
            Tag && (
                <Tag {...delegatedProps} {...props}>
                    {defaultSlot}
                </Tag>
            )
        );
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
        <AsyncBox {...props} loader={async () => (await loader()).default} />
    );
}
