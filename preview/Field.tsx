import { HTMLFieldProps } from 'web-utility';
import { component, formField, observer } from '../source';

@component({
    tagName: 'test-field',
    mode: 'open'
})
@formField
@observer
export class TestField extends HTMLElement {
    declare props: HTMLFieldProps;

    declare name: string;
    declare value: string;

    render() {
        const { name } = this;

        return (
            <input
                name={name}
                // @ts-ignore
                onChange={({ currentTarget: { value } }) =>
                    (this.value = value)
                }
            />
        );
    }
}
