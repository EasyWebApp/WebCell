import './source/DOM-polyfill';
import { createCell, render, component, mixin } from 'web-cell';
import { observable } from 'mobx';

import { observer } from './source';

class Test {
    @observable
    count = 0;
}

describe('Observer decorator', () => {
    const model = new Test();

    it('should re-render Function Component', () => {
        const InlineTag = observer(() => <i>{model.count}</i>);

        render(<InlineTag />);

        expect(document.body.textContent.trim()).toBe('0');

        model.count++;

        expect(document.body.textContent.trim()).toBe('1');
    });

    it('should re-render Class Component', () => {
        // @ts-ignore
        @observer
        @component({
            tagName: 'test-tag',
            renderTarget: 'children'
        })
        class TestTag extends mixin() {
            render() {
                return <i>{model.count}</i>;
            }
        }

        render(<TestTag />);

        expect(document.querySelector('test-tag i').textContent.trim()).toBe(
            '1'
        );

        model.count++;

        expect(document.querySelector('test-tag i').textContent.trim()).toBe(
            '2'
        );
    });
});
