import 'element-internals-polyfill';

import { DOMRenderer } from 'dom-renderer';
import { configure } from 'mobx';
import { sleep } from 'web-utility';

import { lazy } from '../source/Async';
import { FC, observer } from '../source/decorator';
import { WebCellProps } from '../source/WebCell';

configure({ enforceActions: 'never' });

describe('Async Box component', () => {
    const renderer = new DOMRenderer();

    afterEach(() => renderer.render(<></>));

    it('should render an Async Component', async () => {
        const Async = observer(async ({ children, ...props }: WebCellProps<HTMLAnchorElement>) => {
            await sleep(1);

            return <a {...props}>{children}</a>;
        });
        renderer.render(<Async href="test">Async Component</Async>);

        expect(document.body.innerHTML).toBe('<function-cell></function-cell>');

        await sleep(2);

        expect(document.body.innerHTML).toBe(
            '<function-cell><a href="test">Async Component</a></function-cell>'
        );
    });

    it('should render a Sync Component after Async Loading', async () => {
        const Sync: FC<WebCellProps<HTMLAnchorElement>> = ({ children, ...props }) => (
            <a {...props}>{children}</a>
        );

        const Async = lazy(async () => ({ default: Sync }));

        renderer.render(<Async href="test">Sync Component from Async Loading</Async>);
        expect(document.body.innerHTML).toBe('<function-cell></function-cell>');

        await sleep();

        expect(document.body.innerHTML).toBe(
            '<function-cell><a href="test">Sync Component from Async Loading</a></function-cell>'
        );
    });
});
