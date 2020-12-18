import 'element-internals-polyfill';

import { render, createCell } from '../source/renderer';
import { component } from '../source/decorator';
import { WebFieldProps, mixinForm } from '../source/WebField';

const delay = (second: number) =>
    new Promise(resolve => setTimeout(resolve, second * 1000));

describe('Field Class & Decorator', () => {
    @component({
        tagName: 'test-input'
    })
    class TestInput extends mixinForm<
        { a?: number } & WebFieldProps,
        { b: string }
    >() {
        state = { b: '' };
    }

    it('should define a Custom Field Element', () => {
        render(<TestInput />);

        expect(self.customElements.get('test-input')).toBe(TestInput);
        expect(document.querySelector('test-input').tagName.toLowerCase()).toBe(
            'test-input'
        );
    });

    it('should have simple Form properties', async () => {
        const input = new TestInput();

        input.name = 'test';
        await delay(0.05);
        expect(input.getAttribute('name')).toBe('test');

        input.required = true;
        await delay(0.05);
        expect(input.hasAttribute('required')).toBeTruthy();
    });

    it('should have advanced Form properties', () => {
        const input = new TestInput();

        input.defaultValue = 'example';
        expect(input.defaultValue === input.getAttribute('value')).toBeTruthy();

        const form = document.createElement('form');
        form.append(input);
        expect(input.form === form).toBeTruthy();
    });
});
