import type {} from 'element-internals-polyfill';
import { BaseFieldProps } from 'web-utility';

import { WebCellProps } from './utility';
import { mixin, WebCellClass, WebCellComponent } from './WebCell';
import { watch, attribute } from './decorator';

export interface WebFieldProps extends BaseFieldProps, WebCellProps {}

export interface WebFieldComponent<
    P extends WebFieldProps = WebFieldProps,
    S = {}
> extends WebCellComponent<P, S> {
    /**
     * Called when the browser associates the element with a form element,
     * or disassociates the element from a form element.
     */
    formAssociatedCallback?(form: HTMLFormElement): void;
    /**
     * Called after the disabled state of the element changes,
     * either because the disabled attribute of this element was added or removed;
     * or because the disabled state changed on a `<fieldset>` that's an ancestor of this element.
     *
     * @param disabled This parameter represents the new disabled state of the element.
     */
    formDisabledCallback?(disabled: boolean): void;
    /**
     * Called after the form is reset.
     * The element should reset itself to some kind of default state.
     */
    formResetCallback?(): void;
    /**
     * Called in one of two circumstances:
     *   - When the browser restores the state of the element (for example, after a navigation, or when the browser restarts). The `mode` argument is `"restore"` in this case.
     *   - When the browser's input-assist features such as form autofilling sets a value. The `mode` argument is `"autocomplete"` in this case.
     *
     * @param state The type of this argument depends on how the `this.internals.setFormValue()` method was called.
     * @param mode
     */
    formStateRestoreCallback?(
        state: string | File | FormData,
        mode: 'restore' | 'autocomplete'
    ): void;
}

export interface WebFieldClass<P extends WebFieldProps = WebFieldProps, S = {}>
    extends WebCellClass<P, S> {
    new (options?: ShadowRootInit): WebFieldComponent<P, S>;
}

export function mixinForm<P extends WebFieldProps = WebFieldProps, S = {}>(
    superClass = HTMLElement
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
