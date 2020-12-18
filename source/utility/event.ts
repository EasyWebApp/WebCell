export type DelegateEventHandler<T = any> = (
    event: Event,
    currentTarget: Element,
    detail?: T
) => any;

export function delegate<T>(
    selector: string,
    handler: DelegateEventHandler<T>
) {
    return function (this: Node, event: Event) {
        var node,
            path = event.composedPath();

        while ((node = path.shift()) && node !== event.currentTarget)
            if (node instanceof HTMLElement && node.matches(selector))
                return handler.call(
                    this,
                    event,
                    node,
                    (event as CustomEvent).detail
                );
    };
}

export const documentReady = new Promise<void>(resolve => {
    const done = () => resolve();

    document.addEventListener('DOMContentLoaded', done);

    self.addEventListener('load', () => done);

    setTimeout(function check() {
        document.readyState === 'complete' ? resolve() : setTimeout(check);
    });
});
