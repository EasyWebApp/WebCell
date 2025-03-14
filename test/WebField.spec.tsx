import 'element-internals-polyfill';

import { DOMRenderer } from 'dom-renderer';
import { configure } from 'mobx';
import { sleep } from 'web-utility';

import { observer } from '../source/decorator';
import { component, WebCellProps } from '../source/WebCell';
import { formField, WebField } from '../source/WebField';

configure({ enforceActions: 'never' });

describe('Field Class & Decorator', () => {
    const renderer = new DOMRenderer();

    interface TestInputProps extends WebCellProps<HTMLInputElement> {
        a?: number;
    }

    interface TestInput extends WebField<TestInputProps> {}

    @component({ tagName: 'test-input' })
    @formField
    @observer
    class TestInput extends HTMLElement implements WebField<TestInputProps> {}

    it('should define a Custom Field Element', () => {
        renderer.render(<TestInput />);

        expect(customElements.get('test-input')).toBe(TestInput);

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
