import 'element-internals-polyfill';
import { sleep } from 'web-utility';

import { WebCellProps } from '../source/utility/vDOM';
import { createCell, render } from '../source/renderer';
import { lazy } from '../source/Async';

describe('Async Box component', () => {
    it('should render an Async Component', async () => {
        const Async = lazy(async () => ({
            default: ({
                defaultSlot,
                ...props
            }: WebCellProps<HTMLAnchorElement>) => (
                <a {...props}>{defaultSlot}</a>
            )
        }));
        render(<Async href="test">Test</Async>);

        expect(document.body.innerHTML).toBe('<async-box></async-box>');

        await sleep();

        expect(document.body.innerHTML).toBe(
            '<async-box><a href="test">Test</a></async-box>'
        );
    });
});
