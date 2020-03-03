export type DelegateEventHandler = (
    event: Event,
    currentTarget: Element,
    detail: any
) => any;

export function delegate(selector: string, handler: DelegateEventHandler) {
    return function(this: Node, event: Event) {
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
