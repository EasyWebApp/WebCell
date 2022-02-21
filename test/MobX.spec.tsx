import 'element-internals-polyfill';
import { sleep } from 'web-utility';
import { observable } from 'mobx';

import { component, observer, reaction } from '../source/decorator';
import { WebCell } from '../source/WebCell';
import { createCell, render } from '../source/renderer';

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
        @component({
            tagName: 'test-tag'
        })
        @observer
        class TestTag extends WebCell() {
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

    it('should register a Reaction with MobX', async () => {
        const handler = jest.fn();

        @component({
            tagName: 'reaction-cell'
        })
        @observer
        class ReactionCell extends WebCell() {
            @observable
            test = '';

            @reaction((element: ReactionCell) => element.test)
            handleReaction(value: string) {
                handler(value);
            }
        }
        render(<ReactionCell />);

        const tag = document.querySelector<ReactionCell>('reaction-cell');
        tag.test = 'a';

        await sleep();

        expect(handler).toBeCalledTimes(1);
        expect(handler).toBeCalledWith('a');

        document.body.innerHTML = '';

        expect(tag.disposers).toHaveLength(0);
    });
});
