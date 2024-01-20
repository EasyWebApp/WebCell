import { WebField, component, formField, observer } from '../source';

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
                // @ts-ignore
                onChange={({ currentTarget: { value } }) =>
                    (this.value = value)
                }
            />
        );
    }
}
