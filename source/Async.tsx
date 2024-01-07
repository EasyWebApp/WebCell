import { observable } from 'mobx';
import { HTMLProps } from 'web-utility';

import { ClassComponent, WebCell, component } from './WebCell';
import {
    FunctionComponent,
    WebCellComponent,
    observer,
    reaction
} from './decorator';

export type ComponentTag = string | WebCellComponent;

export type WebCellProps<T extends HTMLElement = HTMLElement> = HTMLProps<T>;

export interface AsyncBoxProps extends WebCellProps {
    loader: () => Promise<ComponentTag>;
    delegatedProps?: WebCellProps;
}

export interface AsyncBox extends WebCell {}

@component({
    tagName: 'async-box'
})
@observer
export class AsyncBox extends HTMLElement {
    declare props: AsyncBoxProps;

    @observable
    accessor loader: AsyncBoxProps['loader'];

    @observable
    accessor component: ComponentTag;

    @observable
    accessor delegatedProps: AsyncBoxProps['delegatedProps'];

    connectedCallback() {
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
        const { children, ...data } = { ...props, ...delegatedProps };

        return Tag && <Tag {...data}>{children}</Tag>;
    }
}

type GetAsyncProps<T> = T extends () => Promise<{
    default: FunctionComponent<infer P> | ClassComponent;
}>
    ? P
    : {};

export function lazy<
    T extends () => Promise<{ default: FunctionComponent | ClassComponent }>
>(loader: T) {
    return (props: GetAsyncProps<T>) => (
        <AsyncBox
            delegatedProps={props}
            loader={async () => (await loader()).default}
        />
    );
}
