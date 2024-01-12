import { JsxProps } from 'dom-renderer';
import { observable } from 'mobx';

import { ClassComponent, WebCell, component } from './WebCell';
import {
    FC,
    FunctionComponent,
    PropsWithChildren,
    WebCellComponent,
    observer
} from './decorator';

export type ComponentTag = string | WebCellComponent;

export type WebCellProps<T extends HTMLElement = HTMLElement> = JsxProps<T>;

export interface AsyncCellProps extends WebCellProps {
    loader: () => Promise<ComponentTag>;
    delegatedProps?: WebCellProps;
}

export interface AsyncCell extends WebCell {}

@component({
    tagName: 'async-cell'
})
@observer
export class AsyncCell extends HTMLElement {
    declare props: AsyncCellProps;

    loader: AsyncCellProps['loader'];

    @observable
    accessor component: FC<PropsWithChildren>;

    @observable
    accessor delegatedProps: AsyncCellProps['delegatedProps'];

    connectedCallback() {
        this.load();
    }

    protected async load() {
        this.component = undefined;

        const Tag = await this.loader();

        this.component = ({ children, ...props }) => (
            <Tag {...props}>{children}</Tag>
        );
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
        <AsyncCell
            delegatedProps={props}
            loader={async () => (await loader()).default}
        />
    );
}
