import { promisify } from './event';

export function durationOf(
    type: 'transition' | 'animation',
    element: HTMLElement
) {
    const { transitionDuration, animationDuration } = getComputedStyle(element);

    const duration =
        type === 'animation' ? animationDuration : transitionDuration;

    return parseFloat(duration) * (duration.slice(-2) === 'ms' ? 1 : 1000);
}

export function watchMotion<T extends Event>(
    type: 'transition' | 'animation',
    element: HTMLElement
) {
    return Promise.race([
        promisify<T>(type, element).catch(event => Promise.resolve(event)),
        new Promise(resolve => setTimeout(resolve, durationOf(type, element)))
    ]);
}

function fadeIn<T extends Event>(
    type: 'transition' | 'animation',
    element: HTMLElement,
    className: string,
    display: string
) {
    element.style.display = display;

    const end = watchMotion<T>(type, element);

    return new Promise<T>(resolve =>
        self.requestAnimationFrame(() => {
            element.classList.add(className);

            end.then(resolve);
        })
    );
}

async function fadeOut<T extends Event>(
    type: 'transition' | 'animation',
    element: HTMLElement,
    className: string,
    remove?: boolean
) {
    const end = watchMotion<T>(type, element);

    element.classList.remove(className);

    await end;

    if (remove) element.remove();
    else element.style.display = 'none';
}

export function transitIn(
    element: HTMLElement,
    className: string,
    display = 'block'
) {
    return fadeIn<TransitionEvent>('transition', element, className, display);
}

export function animateIn(
    element: HTMLElement,
    className: string,
    display = 'block'
) {
    return fadeIn<AnimationEvent>('animation', element, className, display);
}

export function transitOut(
    element: HTMLElement,
    className: string,
    remove?: boolean
) {
    return fadeOut<TransitionEvent>('transition', element, className, remove);
}

export function animateOut(
    element: HTMLElement,
    className: string,
    remove?: boolean
) {
    return fadeOut<AnimationEvent>('animation', element, className, remove);
}
