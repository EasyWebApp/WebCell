import { observable } from 'mobx';
import { CustomFormElement, HTMLFieldProps } from 'web-utility';

import { attribute, reaction } from './decorator';
import { ClassComponent, WebCell } from './WebCell';

export interface WebField<P = {}>
    extends CustomFormElement,
        WebCell<P & HTMLFieldProps> {}

/**
 * `class` decorator of Form associated Web components
 */
export function formField<T extends ClassComponent>(
    Class: T,
    _: ClassDecoratorContext
) {
    class FormFieldComponent
        extends (Class as ClassComponent)
        implements CustomFormElement
    {
        /**
         * Defined in {@link component}
         */
        declare internals: ElementInternals;
        static formAssociated = true;

        @reaction(({ value }) => value)
        setValue(value: string) {
            this.internals.setFormValue(value);
        }

        formDisabledCallback(disabled: boolean) {
            this.disabled = disabled;
        }

        @attribute
        @observable
        accessor name: string;

        @observable
        accessor value: string;

        @attribute
        @observable
        accessor required: boolean;

        @attribute
        @observable
        accessor disabled: boolean;

        @attribute
        @observable
        accessor autofocus: boolean;

        set defaultValue(raw: string) {
            this.setAttribute('value', raw);

            this.value ??= raw;
        }

        get defaultValue() {
            return this.getAttribute('value');
        }

        get form() {
            return this.internals.form;
        }
        get validity() {
            return this.internals.validity;
        }
        get validationMessage() {
            return this.internals.validationMessage;
        }
        get willValidate() {
            return this.internals.willValidate;
        }
        checkValidity() {
            return this.internals.checkValidity();
        }
        reportValidity() {
            return this.internals.reportValidity();
        }
    }

    return FormFieldComponent as unknown as T;
}
