import 'element-internals-polyfill';
import { sleep } from 'web-utility';

import { render, createCell } from '../source/renderer';
import { component, observer } from '../source/decorator';
import { WebFieldProps, WebField } from '../source/WebField';

describe('Field Class & Decorator', () => {
    @component({
        tagName: 'test-input'
    })
    @observer
    class TestInput extends WebField<{ a?: number } & WebFieldProps>() {}

    it('should define a Custom Field Element', () => {
        render(<TestInput />);

        expect(self.customElements.get('test-input')).toBe(TestInput);
        expect(document.querySelector('test-input').tagName.toLowerCase()).toBe(
            'test-input'
        );
    });

    it('should have simple Form properties', async () => {
        const input = document.querySelector<TestInput>('test-input');

        input.name = 'test';
        await sleep();
        expect(input.getAttribute('name')).toBe('test');

        input.required = true;
        await sleep();
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
