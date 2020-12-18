import type {} from 'element-internals-polyfill';
import { Constructor } from 'web-utility/source/data';
import { BaseFieldProps, CustomFormElement } from 'web-utility/source/DOM-type';

import { WebCellProps } from './utility';
import { mixin, WebCellComponent } from './WebCell';
import { watch, attribute } from './decorator';

export interface WebFieldProps extends BaseFieldProps, WebCellProps {}

export type WebFieldComponent<
    P extends WebFieldProps = WebFieldProps,
    S = {}
> = CustomFormElement & WebCellComponent<P, S>;

export type WebFieldClass<
    P extends WebFieldProps = WebFieldProps,
    S = {}
> = Constructor<WebFieldComponent<P, S>>;

export function mixinForm<P extends WebFieldProps = WebFieldProps, S = {}>(
    superClass: Constructor<HTMLElement> = HTMLElement
): WebFieldClass<P, S> {
    class WebField
        extends mixin<P, S>(superClass)
        implements WebFieldComponent<P, S> {
        static formAssociated = true;

        @attribute
        @watch
        name: string;

        @watch
        value: string;

        @attribute
        @watch
        required: boolean;

        @attribute
        @watch
        disabled: boolean;

        @attribute
        @watch
        placeholder: string;

        @attribute
        @watch
        autofocus: boolean;

        set defaultValue(raw: string) {
            this.setAttribute('value', raw);

            this.props.value ?? (this.value = raw);
        }

        get defaultValue() {
            return this.getAttribute('value');
        }

        protected internals = this.attachInternals();

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
