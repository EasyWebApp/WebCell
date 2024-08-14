# WebCell v2 to v3 migration

## React-style State has been totally dropped

**WebCell v3** is heavily inspired by [the **Local Observable State** idea of **MobX**][1], and [not only React][2], Web Components can be much easier to manage the **Inner State & Logic**, without any complex things:

1. State type declaration
2. `this.state` declaration & its type annotation/assertion
3. `this.setState()` method calling & its callback
4. confusive _Hooks API_...

Just declare a **State Store class** as what the **Global State Managment** does, and initial it on the `this` (a **Web Component instance**). Then use the state, and observe them, as [MobX][3]'s usual, everything is done.

```diff
import {
    component,
+   observer,
-   mixin,
-   createCell,
-   Fragment
} from 'web-cell';
+import { observable } from 'mobx';

-interface State {
+class State {
+   @observable
-   key: string;
+   accessor key = '';
}

@component({
    tagName: 'my-tag'
})
+@observer
-export class MyTag extends mixin<{}, State>() {
+export class MyTag extends HTMLElement {
-   state: Readonly<State> = {
-       key: 'value'
-   };
+   state = new State();

-   render({}: any, { key }: State) {
+   render() {
+       const { key } = this.state;

        return <>{value}</>;
    }
}
```

At the same time, `shouldUpdate() {}` life-cycle has been dropped. You just need to control the logic before states changed in your `State` class methods.

## DOM properties become observable data

**DOM properties** aren't like React's props, they're **reactive**. They are not only responsible to **update Component views**, but also **synchronize with HTML attriutes**.

MobX's [`@observable`][4] & [`reaction()`][5] are awesome APIs to implement these above with clear codes, so we add `mobx` package as a dependency:

```shell
npm install mobx
```

On the other hand, [`mobx-web-cell` adapter][6] has been merged into the core package.

```diff
+import { JsxProps } from 'dom-renderer';
import {
-   WebCellProps,
    component,
    attribute,
-   watch,
+   observer,
-   mixin,
-   createCell,
-   Fragment
} from 'web-cell';
-import { observer } from 'mobx-web-cell';
+import { observable } from 'mobx';

-export interface MyTagProps extends WebCellProps {
+export interface MyTagProps extends JsxProps<HTMLElement> {
    count?: number
}

@component({
    tagName: 'my-tag'
})
@observer
-export class MyTag extends mixin<MyTagProps>() {
+export class MyTag extends HTMLElement {
+   declare props: MyTagProps;

    @attribute
-   @watch
+   @observable
-   count = 0;
+   accessor count = 0;

-   render({ count }: MyTagProps) {
+   render() {
+       const { count } = this;

        return <>{count}</>;
    }
}
```

## control Render Target with Shadow DOM `mode` option

### render to `children`

```diff
import {
    component,
-   mixin
} from 'web-cell';

@component({
    tagName: 'my-tag',
-   renderTarget: 'children'
})
-export class MyTag extends mixin() {
+export class MyTag extends HTMLElement {
}
```

### render to `shadowRoot`

```diff
import {
    component,
-   mixin
} from 'web-cell';

@component({
    tagName: 'my-tag',
-   renderTarget: 'shadowRoot'
+   mode: 'open'
})
-export class MyTag extends mixin() {
+export class MyTag extends HTMLElement {
}
```

## move Shadow CSS injection into `render()`

This makes **Shadow CSS** to react with Observable Data updating.

```diff
+import { stringifyCSS } from 'web-utility';
import {
    component,
-   mixin
} from 'web-cell';

@component({
    tagName: 'my-tag',
-   renderTarget: 'shadowRoot',
+   mode: 'open',
-   style: {
-       ':host(.active)': {
-           color: 'red'
-       }
-   }
})
-export class MyTag extends mixin() {
+export class MyTag extends HTMLElement {
    render() {
        return <>
+           <style>
+               {stringifyCSS({
+                   ':host(.active)': {
+                       color: 'red'
+                   }
+               })}
+           </style>
            test
        </>;
    }
}
```

## replace some APIs

1. `mixin()` => `HTMLElement` & its Sub-classes
2. `mixinForm()` => `HTMLElement` & `@formField`
3. `@watch` => `@observable accessor`

## Appendix: v3 prototype

1. [Legacy architecture](https://codesandbox.io/s/web-components-jsx-i7u60?file=/index.tsx)
2. [Modern architecture](https://codesandbox.io/s/mobx-web-components-pvn9rf?file=/src/WebComponent.ts)
3. [MobX lite](https://codesandbox.io/s/mobx-lite-791eg?file=/src/index.ts)

[1]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/refguide/observer-component.md#local-observable-state-in-class-based-components
[2]: https://blog.cloudboost.io/3-reasons-why-i-stopped-using-react-setstate-ab73fc67a42e
[3]: https://github.com/mobxjs/mobx/tree/mobx4and5/docs
[4]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/refguide/observable-decorator.md
[5]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/refguide/reaction.md
[6]: https://github.com/EasyWebApp/WebCell/tree/v2/MobX
