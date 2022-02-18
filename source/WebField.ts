import { observable, reaction } from 'mobx';
import {
    Constructor,
    CustomFormElement,
    CustomFormElementClass
} from 'web-utility';

import { WebCell, WebCellComponent } from './WebCell';
import { attribute } from './decorator';
import { WebCellProps } from './utility';

export type WebFieldProps<T extends HTMLElement = HTMLInputElement> =
    WebCellProps<T>;

export type WebFieldComponent<P extends WebFieldProps = WebFieldProps> =
    CustomFormElement & WebCellComponent<P>;

export type WebFieldClass<P extends WebFieldProps = WebFieldProps> = Pick<
    CustomFormElementClass,
    'observedAttributes' | 'formAssociated'
> &
    Constructor<WebFieldComponent<P>>;

export function WebField<
    P extends WebFieldProps = WebFieldProps
>(): WebFieldClass<P> {
    class WebField extends WebCell<P>() implements WebFieldComponent<P> {
        static formAssociated = true;

        connectedCallback() {
            this.disposers.push(
                reaction(
                    () => this.value,
                    value => this.internals.setFormValue(value)
                )
            );
        }

        formDisabledCallback(disabled: boolean) {
            this.disabled = disabled;
        }

        @attribute
        @observable
        name: string;

        @observable
        value: string;

        @attribute
        @observable
        required: boolean;

        @attribute
        @observable
        disabled: boolean;

        @attribute
        @observable
        autofocus: boolean;

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
    return WebField;
}
