import { observable } from 'mobx';

import {
    FC,
    FunctionComponent,
    observer,
    PropsWithChildren,
    reaction,
    WebCellComponent
} from './decorator';
import { ClassComponent, component, WebCell, WebCellProps } from './WebCell';

export type ComponentTag = string | WebCellComponent;

export interface AsyncCellProps {
    loader?: () => Promise<ComponentTag>;
    delegatedProps?: WebCellProps;
}

export interface AsyncCell extends WebCell<AsyncCellProps> {}

@component({ tagName: 'async-cell' })
@observer
export class AsyncCell extends HTMLElement implements WebCell<AsyncCellProps> {
    @observable
    accessor loader: AsyncCellProps['loader'];

    @observable
    accessor component: FC<PropsWithChildren>;

    @observable
    accessor delegatedProps: AsyncCellProps['delegatedProps'];

    @reaction(({ loader }) => loader)
    async connectedCallback() {
        const { loader } = this;

        if (!loader) return;

        this.component = undefined;

        const Tag = await loader();

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

export const lazy =
    <T extends () => Promise<{ default: FunctionComponent | ClassComponent }>>(
        loader: T
    ) =>
    (props: GetAsyncProps<T>) => (
        <AsyncCell
            delegatedProps={props}
            loader={async () => (await loader()).default}
        />
    );
