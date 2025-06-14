# WebCell 从 v2 到 v3 的迁移

## 类 React 状态管理已被完全移除

**WebCell v3** 受到了 [**MobX** 的 **本地可观察状态** 思想][1] 的深刻启发，[不仅仅是 React][2]，Web Components 可以更轻松地管理 **内部状态和逻辑**，无需任何复杂的操作：

1. 状态类型声明
2. `this.state` 声明及其类型注解/断言
3. `this.setState()` 方法的调用及其回调
4. 令人困惑的 _Hooks API_...

只需像管理 **全局状态** 一样声明一个 **状态存储类**，并在 `this`（即 **Web Component 实例**）上初始化它。然后像 [MobX][3] 一样使用并观察这些状态，一切就完成了。

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

@component({ tagName: 'my-tag' })
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

同时，`shouldUpdate() {}` 生命周期方法已被移除。你只需在 `State` 类的方法中，在状态改变之前控制逻辑即可。

## DOM 属性变为可观察数据

**DOM 属性** 不同于 React 的 props，它们是 **响应式的**。它们不仅负责 **更新组件视图**，还会与 **HTML 属性同步**。

MobX 的 [`@observable`][4] 和 [`reaction()`][5] 是实现上述功能的优秀 API，代码也非常清晰，因此我们添加了 `mobx` 包作为依赖：

```shell
npm install mobx
```

另一方面，[`mobx-web-cell` 适配器][6] 已经合并到了核心包中。

```diff
import {
    WebCellProps,
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

export interface MyTagProps extends WebCellProps {
    count?: number
}

@component({ tagName: 'my-tag' })
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

## 使用 Shadow DOM 的 `mode` 选项控制渲染目标

### 渲染到 `children`

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

### 渲染到 `shadowRoot`

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

## 将 Shadow CSS 注入移动到 `render()`

这样使得 **Shadow CSS** 可以随着可观察数据的更新而响应。

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

## 替换部分 API

1. `mixin()` => `HTMLElement` 及其子类
2. `mixinForm()` => `HTMLElement` 和 `@formField`
3. `@watch` => `@observable accessor`

## 附录：v3 原型

1. [旧架构](https://codesandbox.io/s/web-components-jsx-i7u60?file=/index.tsx)
2. [现代架构](https://codesandbox.io/s/mobx-web-components-pvn9rf?file=/src/WebComponent.ts)
3. [MobX 精简版](https://codesandbox.io/s/mobx-lite-791eg?file=/src/index.ts)

[1]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/refguide/observer-component.md#local-observable-state-in-class-based-components
[2]: https://fcc-cd.dev/article/translation/3-reasons-why-i-stopped-using-react-setstate/
[3]: https://github.com/mobxjs/mobx/tree/mobx4and5/docs
[4]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/refguide/observable-decorator.md
[5]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/refguide/reaction.md
[6]: https://github.com/EasyWebApp/WebCell/tree/v2/MobX
