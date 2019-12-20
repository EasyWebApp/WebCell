import { component } from './decorator';
import { mixin } from './WebCell';
import { createCell, VNodeChildElement } from './renderer';
import { Fragment } from './utility';

@component({
    tagName: 'transition-cell',
    renderTarget: 'children'
})
export class TransitionCell extends mixin<{
    className: string;
    activeClass: string;
    defaultSlot: VNodeChildElement | VNodeChildElement[];
}>() {
    set activeClass(name: string) {
        const { props } = this;

        if (name) {
            this.removeAttribute('hidden');

            self.requestAnimationFrame(() => this.classList.add(name));
        } else if (props.activeClass) this.classList.remove(props.activeClass);
        else this.setAttribute('hidden', true);

        this.props.activeClass = name;
    }

    get activeClass() {
        return this.props.activeClass;
    }

    connectedCallback() {
        this.addEventListener('transitionend', ({ target }: Event) => {
            if (this === target && !this.props.activeClass)
                this.setAttribute('hidden', true);
        });
    }

    render() {
        return <Fragment>{this.defaultSlot}</Fragment>;
    }
}
