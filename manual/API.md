# API



## Template syntax

All global variables on `window` are available in **WebCell Template expression**,
including **Scoped variables** shown below:

| Name    | Class         | Reference                                                    |
|:-------:|:-------------:|--------------------------------------------------------------|
| `host`  | `HTMLElement` | Current component                                            |

([More details](https://web-cell.dev/DOM-Renderer/manual/Template.html))



## Life-cycle hook

All [life-cycle hooks defined in Web components specification](https://developers.google.com/web/fundamentals/web-components/customelements#reactions) are available in WebCell,
including **Extension hooks** shown below:

| Signature                                                                     | Execution condition               |
|-------------------------------------------------------------------------------|-----------------------------------|
| `slotChangedCallback(assigned: Node[], slot: HTMLSlotElement, name: ?String)` | Same as `slotchange` event        |
| `viewUpdateCallback(newData: Object, oldData: Object, view: View): Boolean`   | Before current component rendered |
| `viewChangedCallback(data: Object, view: View)`                               | After current component rendered  |
