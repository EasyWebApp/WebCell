import type {} from 'element-internals-polyfill';
import type { ElementInternals } from 'element-internals-polyfill/dist/element-internals';
import type { Constructor } from 'web-utility';
import type { BaseFieldProps, CustomFormElement } from 'web-utility';

import { WebCellProps } from './utility';
import { mixin, WebCellComponent } from './WebCell';
import { attribute } from './decorator';

export interface WebFieldProps extends BaseFieldProps, WebCellProps {}

export interface WebFieldState {
    disabled?: boolean;
}

export interface WebFieldComponent<
    P extends WebFieldProps = WebFieldProps,
    S = {}
> extends CustomFormElement,
        WebCellComponent<P, S> {
    internals: ElementInternals;
}

export type WebFieldClass<
    P extends WebFieldProps = WebFieldProps,
    S = {}
> = Constructor<WebFieldComponent<P, S>>;

export function mixinForm<
    P extends WebFieldProps = WebFieldProps,
    S extends WebFieldState = WebFieldState
>(): WebFieldClass<P, S> {
    class WebField extends mixin<P, S>() implements WebFieldComponent<P, S> {
        static formAssociated = true;

        readonly internals = this.attachInternals();

        formDisabledCallback(disabled: boolean) {
            this.setState({ disabled } as Partial<S>);
        }

        @attribute
        set name(name: string) {
            this.setProps({ name } as Partial<P>);
        }
        get name() {
            return this.props.name;
        }

        set value(value: string) {
            this.setProps({ value } as Partial<P>);
            this.internals.setFormValue(value);
        }
        get value() {
            return this.props.value;
        }

        @attribute
        set required(required: boolean) {
            this.setProps({ required } as Partial<P>);
        }
        get required() {
            return this.props.required;
        }

        @attribute
        set disabled(disabled: boolean) {
            this.setProps({ disabled } as Partial<P>);
        }
        get disabled() {
            return this.props.disabled;
        }

        @attribute
        set autofocus(autofocus: boolean) {
            this.setProps({ autofocus } as Partial<P>);
        }
        get autofocus() {
            return this.props.autofocus;
        }

        set defaultValue(raw: string) {
            this.setAttribute('value', raw);

            this.props.value ?? (this.value = raw);
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
