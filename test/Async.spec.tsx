import 'element-internals-polyfill';
import { sleep } from 'web-utility';
import { configure } from 'mobx';

import { WebCellProps } from '../source/WebCell';
import { DOMRenderer } from 'dom-renderer';
import { FC } from '../source/decorator';
import { lazy } from '../source/Async';

configure({ enforceActions: 'never' });

describe('Async Box component', () => {
    const renderer = new DOMRenderer();

    it('should render an Async Component', async () => {
        const Sync: FC<WebCellProps<HTMLAnchorElement>> = ({
            children,
            ...props
        }) => <a {...props}>{children}</a>;

        const Async = lazy(async () => ({ default: Sync }));

        renderer.render(<Async href="test">Test</Async>);

        expect(document.body.innerHTML).toBe('<async-cell></async-cell>');

        await sleep();

        expect(document.body.innerHTML).toBe(
            '<async-cell><a href="test">Test</a></async-cell>'
        );
    });
});
