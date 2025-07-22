import { VNode } from 'dom-renderer';
import { observable } from 'mobx';

import { AFC, FC, FunctionComponent, observer, WebCellComponent } from './decorator';
import { ClassComponent, component, WebCell, WebCellProps } from './WebCell';

export type ComponentTag = string | WebCellComponent;

export interface FunctionCellProps extends WebCellProps {
    component: FC | AFC;
}
export interface FunctionCell extends WebCell<FunctionCellProps> {}

@component({ tagName: 'function-cell' })
@observer
export class FunctionCell extends HTMLElement implements WebCell<FunctionCellProps> {
    @observable
    accessor component: FunctionCellProps['component'];

    @observable
    accessor vNode: VNode | undefined;

    render() {
        const result = this.vNode || this.component({});

        if (!(result instanceof Promise)) return result;

        result.then(vNode => (this.vNode = vNode));
    }
}

type GetAsyncProps<T> = T extends () => Promise<{
    default: FunctionComponent<infer P> | ClassComponent;
}>
    ? P
    : {};

export const lazy =
    <T extends () => Promise<{ default: FunctionComponent | ClassComponent }>>(loader: T) =>
    (props: GetAsyncProps<T>) => (
        <FunctionCell
            component={async () => {
                const { default: Tag } = await loader();

                return <Tag {...props} />;
            }}
        />
    );
