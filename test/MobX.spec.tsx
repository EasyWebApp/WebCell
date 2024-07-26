import 'element-internals-polyfill';

import { sleep } from 'web-utility';
import { configure, observable } from 'mobx';

import { observer, reaction } from '../source/decorator';
import { component } from '../source/WebCell';
import { DOMRenderer } from 'dom-renderer';

configure({ enforceActions: 'never' });

class Test {
    @observable
    accessor count = 0;
}

describe('Observer decorator', () => {
    const model = new Test(),
        renderer = new DOMRenderer();

    it('should re-render Function Component', () => {
        const InlineTag = observer(() => <i>{model.count}</i>);

        renderer.render(<InlineTag />);

        expect(document.body.textContent.trim()).toBe('0');

        model.count++;

        expect(document.body.textContent.trim()).toBe('1');
    });

    it('should re-render Class Component', () => {
        @component({ tagName: 'test-tag' })
        @observer
        class TestTag extends HTMLElement {
            render() {
                return <i>{model.count}</i>;
            }
        }
        renderer.render(<TestTag />);

        expect(document.querySelector('test-tag i').textContent.trim()).toBe(
            '1'
        );
        model.count++;

        expect(document.querySelector('test-tag i').textContent.trim()).toBe(
            '2'
        );
    });

    it('should register a Reaction with MobX', async () => {
        const handler = jest.fn();

        @component({ tagName: 'reaction-cell' })
        @observer
        class ReactionCell extends HTMLElement {
            @observable
            accessor test = '';

            @reaction(({ test }) => test)
            handleReaction(value: string) {
                handler(value);
            }
        }
        renderer.render(<ReactionCell />);

        await sleep();

        const tag = document.querySelector<ReactionCell>('reaction-cell');
        tag.test = 'a';

        await sleep();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith('a');

        document.body.innerHTML = '';
    });
});
