import { observable } from 'mobx';
import { importCSS } from 'web-utility';

import { attribute, FC, observer, reaction } from '../decorator';
import { animated } from '../utility';
import { component, WebCell, WebCellProps } from '../WebCell';
import { AnimationType } from './type';

export * from './type';

export interface AnimateCSSProps {
    type: AnimationType;
    component: FC<WebCellProps>;
}

export interface AnimateCSS extends WebCell<AnimateCSSProps> {}

@component({ tagName: 'animation-css' })
@observer
export class AnimateCSS
    extends HTMLElement
    implements WebCell<AnimateCSSProps>
{
    @attribute
    @observable
    accessor type: AnimationType;

    @attribute
    @observable
    accessor playing = false;

    component: FC<WebCellProps>;

    async connectedCallback() {
        await importCSS('https://unpkg.com/animate.css@4/animate.min.css');

        this.typeChanged();
    }

    @reaction(({ type }) => type)
    async typeChanged() {
        this.playing = true;

        await animated(this, '.animate__animated');

        this.playing = false;
    }

    render() {
        const { type, playing, component: Tag } = this;

        return playing ? (
            <Tag className={`animate__animated animate__${type}`} />
        ) : type.includes('Out') ? (
            <></>
        ) : (
            <Tag />
        );
    }
}
