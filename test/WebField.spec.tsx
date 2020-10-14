import 'element-internals-polyfill';

import { render, createCell } from '../source';
import { component } from '../source/decorator';
import { mixinForm } from '../source/WebField';

describe('Field Class & Decorator', () => {
    it('should define a Custom Field Element', () => {
        @component({
            tagName: 'test-input'
        })
        class TestInput extends mixinForm<{ a?: number }, { b: string }>() {
            state = { b: '' };
        }

        render(<TestInput />);

        expect(self.customElements.get('test-input')).toBe(TestInput);
        expect(document.querySelector('test-input').tagName.toLowerCase()).toBe(
            'test-input'
        );
    });
});
