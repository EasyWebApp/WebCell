import 'element-internals-polyfill';

import { DOMRenderer } from 'dom-renderer';
import { configure } from 'mobx';
import { sleep } from 'web-utility';

import { lazy } from '../source/Async';
import { FC } from '../source/decorator';
import { WebCellProps } from '../source/WebCell';

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
