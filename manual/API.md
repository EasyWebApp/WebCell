# API



## Template variable

All global variables on `window` are available in **WebCell Template expression**,
including **Scoped variables** shown below:

| Name    | Class         | Reference                                                    |
|:-------:|:-------------:|--------------------------------------------------------------|
| `host`  | `HTMLElement` | Current component                                            |
| `this`  | `HTMLElement` | The element which current Template expression locates at     |
| `view`  | `View`        | The view which current Template expression locates at        |
| `scope` | `View`        | The parent view which current Template expression locates at |



## Life-cycle hook

All [life-cycle hooks defined in Web components specification](https://developers.google.com/web/fundamentals/web-components/customelements#reactions) are available in WebCell,
including **Extension hooks** shown below:

| Signature                                                                     | Execution condition               |
|-------------------------------------------------------------------------------|-----------------------------------|
| `slotChangedCallback(assigned: Node[], slot: HTMLSlotElement, name: ?String)` | Same as `slotchange` event        |
| `viewUpdateCallback(newData: Object, oldData: Object, view: View): Boolean`   | Before current component rendered |
| `viewChangedCallback(data: Object, view: View)`                               | After current component rendered  |
