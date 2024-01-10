import { observable } from 'mobx';
import { JsxProps } from 'dom-renderer';

import { ClassComponent, WebCell, component } from './WebCell';
import {
    FC,
    FunctionComponent,
    PropsWithChildren,
    WebCellComponent,
    observer,
    reaction
} from './decorator';

export type ComponentTag = string | WebCellComponent;

export type WebCellProps<T extends HTMLElement = HTMLElement> = JsxProps<T>;

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
    accessor component: FC<PropsWithChildren>;

    @observable
    accessor delegatedProps: AsyncBoxProps['delegatedProps'];

    connectedCallback() {
        this.load();
    }

    @reaction((element: AsyncBox) => element.loader)
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
        <AsyncBox
            delegatedProps={props}
            loader={async () => (await loader()).default}
        />
    );
}
