import { component, formField, observer, WebField } from '../source';

export interface TestField extends WebField {}

@component({
    tagName: 'test-field',
    mode: 'open'
})
@formField
@observer
export class TestField extends HTMLElement implements WebField {
    render() {
        const { name } = this;

        return (
            <input
                name={name}
                onChange={({ currentTarget }) =>
                    (this.value = (currentTarget as HTMLInputElement).value)
                }
            />
        );
    }
}
