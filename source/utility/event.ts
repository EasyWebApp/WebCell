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

export const documentReady = new Promise(resolve => {
    document.addEventListener('DOMContentLoaded', resolve);

    self.addEventListener('load', resolve);

    setTimeout(function check() {
        document.readyState === 'complete' ? resolve() : setTimeout(check);
    });
});
