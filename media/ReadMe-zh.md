# WebCell

![WebCell logo](https://web-cell.dev/WebCell-0.f9823b00.png)

简体中文 | [English](./)

基于 VDOM、[JSX][2]、[MobX][3] 和 [TypeScript][4] 的 [Web 组件][1] 引擎

[![NPM 依赖性](https://img.shields.io/librariesio/github/EasyWebApp/WebCell.svg)][5]
[![CI 和 CD](https://github.com/EasyWebApp/WebCell/actions/workflows/main.yml/badge.svg)][6]

[![反 996 许可证](https://img.shields.io/badge/license-Anti%20996-blue.svg)][7]
[![UI 库推荐榜单](https://jaywcjlove.github.io/sb/ico/awesome.svg)][8]

[![幻灯片](https://img.shields.io/badge/learn-Slideshow-blue)][9]
[![Gitter](https://badges.gitter.im/EasyWebApp/community.svg)][10]

[![编辑 WebCell 示例](https://codesandbox.io/static/img/play-codesandbox.svg)][11]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][12]

## 特性

### 引擎比较

|     特性     |        WebCell 3         |      WebCell 2       |             React             |               Vue                |
| :----------: | :----------------------: | :------------------: | :---------------------------: | :------------------------------: |
|   JS 语言    |    [TypeScript 5][13]    |     TypeScript 4     |   ECMAScript 或 TypeScript    |     ECMAScript 或 TypeScript     |
|   JS 语法    | [ES 装饰器 stage-3][14]  |  ES 装饰器 stage-2   |                               |                                  |
|   XML 语法   |     [JSX import][15]     |     JSX factory      |      JSX factory/import       |   HTML/Vue 模板或 JSX（可选）    |
|   DOM API    |      [Web 组件][16]      |       Web 组件       |            HTML 5+            |             HTML 5+              |
|  视图渲染器  |   [DOM Renderer 2][17]   |       SnabbDOM       |           （内置）            |         SnabbDOM（分叉）         |
|  state API   | [MobX `@observable`][18] |     `this.state`     | `this.state` 或 `useState()`  |     `this.$data` 或 `ref()`      |
|  props API   |    MobX `@observable`    |       `@watch`       | `this.props` 或 `props => {}` | `this.$props` 或 `defineProps()` |
|   状态管理   |      [MobX 6+][19]       |       MobX 4/5       |             Redux             |               VueX               |
|  页面路由器  |      [JSX][20] 标签      | JSX 标签 + JSON 数据 |           JSX 标签            |            JSON 数据             |
| 资源打包工具 |      [Parcel 2][21]      |       Parcel 1       |            webpack            |               Vite               |

## 安装

```shell
npm install dom-renderer mobx web-cell
```

## Web 浏览器用法

[演示和 **GitHub 模板**][22]

### 项目引导

#### 工具链

```shell
npm install parcel @parcel/config-default @parcel/transformer-typescript-tsc -D
```

#### `package.json`

```json
{
    "scripts": {
        "start": "parcel source/index.html --open",
        "build": "parcel build source/index.html --public-url ."
    }
}
```

#### `tsconfig.json`

```json
{
    "compilerOptions": {
        "target": "ES6",
        "module": "ES2020",
        "moduleResolution": "Node",
        "useDefineForClassFields": true,
        "jsx": "react-jsx",
        "jsxImportSource": "dom-renderer"
    }
}
```

#### `.parcelrc`

```json
{
    "extends": "@parcel/config-default",
    "transformers": {
        "*.{ts,tsx}": ["@parcel/transformer-typescript-tsc"]
    }
}
```

#### `source/index.html`

```html
<script src="https://polyfill.web-cell.dev/feature/ECMAScript.js"></script>
<script src="https://polyfill.web-cell.dev/feature/WebComponents.js"></script>
<script src="https://polyfill.web-cell.dev/feature/ElementInternals.js"></script>

<script src="source/MyTag.tsx"></script>

<my-tag></my-tag>
```

### 函数组件

```tsx
import { DOMRenderer } from 'dom-renderer';
import { FC, PropsWithChildren } from 'web-cell';

const Hello: FC<PropsWithChildren> = ({ children = '世界' }) => (
    <h1>你好，{children}！</h1>
);

new DOMRenderer().render(<Hello>WebCell</Hello>);
```

### 类组件

#### 子元素插槽

```tsx
import { DOMRenderer } from 'dom-renderer';
import { component } from 'web-cell';

@component({
    tagName: 'hello-world',
    mode: 'open'
})
class Hello extends HTMLElement {
    render() {
        return (
            <h1>
                你好, <slot />!
            </h1>
        );
    }
}

new DOMRenderer().render(
    <>
        <Hello>WebCell</Hello>
        {/* 或 */}
        <hello-world>WebCell</hello-world>
    </>
);
```

#### DOM 属性

```tsx
import { DOMRenderer } from 'dom-renderer';
import { observable } from 'mobx';
import { WebCell, component, attribute, observer } from 'web-cell';

interface HelloProps {
    name?: string;
}

interface Hello extends WebCell<HelloProps> {}

@component({ tagName: 'hello-world' })
@observer
class Hello extends HTMLElement implements WebCell<HelloProps> {
    @attribute
    @observable
    accessor name = '';

    render() {
        return <h1>你好，{this.name}!</h1>;
    }
}

new DOMRenderer().render(<Hello name="WebCell" />);

// 或在 TypeScript 中提示 HTML 标签属性

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'hello-world': HelloProps;
        }
    }
}
new DOMRenderer().render(<hello-world name="WebCell" />);
```

### 内部状态

#### 函数组件

```tsx
import { DOMRenderer } from 'dom-renderer';
import { observable } from 'mobx';
import { FC, observer } from 'web-cell';

class CounterModel {
    @observable
    accessor times = 0;
}

const couterStore = new CounterModel();

const Counter: FC = observer(() => (
    <button onClick={() => (couterStore.times += 1)}>
        计数：{couterStore.times}
    </button>
));

new DOMRenderer().render(<Counter />);
```

#### 类组件

```tsx
import { DOMRenderer } from 'dom-renderer';
import { observable } from 'mobx';
import { component, observer } from 'web-cell';

@component({ tagName: 'my-counter' })
@observer
class Counter extends HTMLElement {
    @observable
    accessor times = 0;

    handleClick = () => (this.times += 1);

    render() {
        return <button onClick={this.handleClick}>计数：{this.times}</button>;
    }
}

new DOMRenderer().render(<Counter />);
```

### CSS 作用域

#### 内联样式

```tsx
import { component } from 'web-cell';
import { stringifyCSS } from 'web-utility';

@component({
    tagName: 'my-button',
    mode: 'open'
})
export class MyButton extends HTMLElement {
    style = stringifyCSS({
        '.btn': {
            color: 'white',
            background: 'lightblue'
        }
    });

    render() {
        return (
            <>
                <style>{this.style}</style>

                <a className="btn">
                    <slot />
                </a>
            </>
        );
    }
}
```

#### 链接样式表

```tsx
import { component } from 'web-cell';

@component({
    tagName: 'my-button',
    mode: 'open'
})
export class MyButton extends HTMLElement {
    render() {
        return (
            <>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                />
                <a className="btn">
                    <slot />
                </a>
            </>
        );
    }
}
```

#### CSS 模块

##### `scoped.css`

```css
.btn {
    color: white;
    background: lightblue;
}
```

##### `MyButton.tsx`

```tsx
import { WebCell, component } from 'web-cell';

import styles from './scoped.css' assert { type: 'css' };

interface MyButton extends WebCell {}

@component({
    tagName: 'my-button',
    mode: 'open'
})
export class MyButton extends HTMLElement implements WebCell {
    connectedCallback() {
        this.root.adoptedStyleSheets = [styles];
    }

    render() {
        return (
            <a className="btn">
                <slot />
            </a>
        );
    }
}
```

### 事件委托

```tsx
import { component, on } from 'web-cell';

@component({ tagName: 'my-table' })
export class MyTable extends HTMLElement {
    @on('click', ':host td > button')
    handleEdit(event: MouseEvent, { dataset: { id } }: HTMLButtonElement) {
        console.log(`编辑行：${id}`);
    }

    render() {
        return (
            <table>
                <tr>
                    <td>1</td>
                    <td>A</td>
                    <td>
                        <button data-id="1">编辑</button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>B</td>
                    <td>
                        <button data-id="2">编辑</button>
                    </td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>C</td>
                    <td>
                        <button data-id="3">编辑</button>
                    </td>
                </tr>
            </table>
        );
    }
}
```

### MobX reaction

```tsx
import { observable } from 'mobx';
import { component, observer, reaction } from 'web-cell';

@component({ tagName: 'my-counter' })
@observer
export class Counter extends HTMLElement {
    @observable
    accessor times = 0;

    handleClick = () => (this.times += 1);

    @reaction(({ times }) => times)
    echoTimes(newValue: number, oldValue: number) {
        console.log(`新值：${newValue}，旧值：${oldValue}`);
    }

    render() {
        return <button onClick={this.handleClick}>计数：{this.times}</button>;
    }
}
```

### 表单关联

```tsx
import { DOMRenderer } from 'dom-renderer';
import { WebField, component, formField, observer } from 'web-cell';

interface MyField extends WebField {}

@component({
    tagName: 'my-field',
    mode: 'open'
})
@formField
@observer
class MyField extends HTMLElement implements WebField {
    render() {
        const { name } = this;

        return (
            <input
                name={name}
                onChange={({ currentTarget: { value } }) =>
                    (this.value = value)
                }
            />
        );
    }
}

new DOMRenderer().render(
    <form method="POST" action="/api/data">
        <MyField name="test" />

        <button>提交</button>
    </form>
);
```

### 异步组件

#### `AsyncTag.tsx`

```tsx
import { FC } from 'web-cell';

const AsyncTag: FC = () => <div>异步</div>;

export default AsyncTag;
```

#### `index.tsx`

```tsx
import { DOMRenderer } from 'dom-renderer';
import { lazy } from 'web-cell';

const AsyncTag = lazy(() => import('./AsyncTag'));

new DOMRenderer().render(<AsyncTag />);
```

### Animate CSS 组件

```tsx
import { DOMRenderer } from 'dom-renderer';
import { AnimateCSS } from 'web-cell';

new DOMRenderer().render(
    <AnimateCSS type="fadeIn" component={props => <h1 {...props}>淡入</h1>} />
);
```

## Node.js 用法

### 工具链

```shell
npm install jsdom
```

### Polyfill

```js
import 'web-cell/polyfill';
```

### 服务端渲染

https://github.com/EasyWebApp/DOM-Renderer?tab=readme-ov-file#nodejs--bun

## 基础知识

-   [Web 组件][23]
-   [自定义元素][24]
-   [虚拟 DOM][25]
-   [Element Internals][26]
-   [CSS 变量][27]
-   [视图渐变][28]
-   [ECMAScript 6+][29]
-   [TypeScript 5+][4]

## 生命周期钩子

1.  [`connectedCallback`][30]
2.  [`disconnectedCallback`][31]
3.  [`attributeChangedCallback`][32]
4.  [`adoptedCallback`][33]
5.  [`updatedCallback`][34]
6.  [`mountedCallback`][35]
7.  [`formAssociatedCallback`][36]
8.  [`formDisabledCallback`][37]
9.  [`formResetCallback`][38]
10. [`formStateRestoreCallback`][39]

## 脚手架

1.  [基础][22]
2.  [仪表盘][40]
3.  [移动端][41]
4.  [静态网站][42]

## 生态系统

我们建议将这些库与 WebCell 一起使用：

-   **状态管理**：[MobX][3]（也由 **TypeScript** 和 **Decorator** 提供支持）
-   **路由**：[Cell Router][43]
-   **UI 组件**

    -   [BootCell][44]（基于 **BootStrap v5**）
    -   [MDUI][45]（基于 **Material Design v3**）
    -   [GitHub Web Widget][46]

-   **HTTP 请求**：[KoAJAX][47]（基于类 **Koa** 中间件）
-   **实用程序**：[Web utility][48] 方法和类型
-   **事件流**：[Iterable Observer][49]（`Observable` 提案）
-   **MarkDown 集成**：[Parcel MDX transformer][50]（**MDX** 编译器插件）

## 路线图

-   [x] [服务器端渲染][51]
-   [x] [异步组件加载][52]

## [v2 到 v3 迁移](./Migrating-zh.md)

## 更多指南

1. [开发贡献](./Contributing.md)

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://mobx.js.org/
[4]: https://www.typescriptlang.org/
[5]: https://libraries.io/npm/web-cell
[6]: https://github.com/EasyWebApp/WebCell/actions/workflows/main.yml
[7]: https://github.com/996icu/996.ICU/blob/master/LICENSE
[8]: https://github.com/jaywcjlove/awesome-uikit
[9]: https://tech-query.me/programming/web-components-practise/slide.html
[10]: https://gitter.im/EasyWebApp/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
[11]: https://codesandbox.io/p/devbox/9gyll?embed=1&file=%2Fsrc%2FClock.tsx
[12]: https://nodei.co/npm/web-cell/
[13]: https://www.typescriptlang.org/
[14]: https://github.com/tc39/proposal-decorators
[15]: https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
[16]: https://www.webcomponents.org/
[17]: https://github.com/EasyWebApp/DOM-Renderer
[18]: https://mobx.js.org/observable-state.html#observable
[19]: https://mobx.js.org/enabling-decorators.html
[20]: https://facebook.github.io/jsx/
[21]: https://parceljs.org/
[22]: https://github.com/EasyWebApp/WebCell-scaffold
[23]: https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components
[24]: https://web.dev/articles/custom-elements-v1?hl=zh-cn
[25]: https://web.dev/articles/shadowdom-v1?hl=zh-cn
[26]: https://web.dev/articles/more-capable-form-controls?hl=zh-cn
[27]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties
[28]: https://developer.chrome.com/docs/web-platform/view-transitions?hl=zh-cn
[29]: https://rse.github.io/es6-features/
[30]: https://web-cell.dev/web-utility/interfaces/CustomElement.html#connectedCallback
[31]: https://web-cell.dev/web-utility/interfaces/CustomElement.html#disconnectedCallback
[32]: https://web-cell.dev/web-utility/interfaces/CustomElement.html#attributeChangedCallback
[33]: https://web-cell.dev/web-utility/interfaces/CustomElement.html#adoptedCallback
[34]: https://web-cell.dev/WebCell/interfaces/WebCell.html#updatedCallback
[35]: https://web-cell.dev/WebCell/interfaces/WebCell.html#mountedCallback
[36]: https://web-cell.dev/web-utility/interfaces/CustomFormElement.html#formAssociatedCallback
[37]: https://web-cell.dev/web-utility/interfaces/CustomFormElement.html#formDisabledCallback
[38]: https://web-cell.dev/web-utility/interfaces/CustomFormElement.html#formResetCallback
[39]: https://web-cell.dev/web-utility/interfaces/CustomFormElement.html#formStateRestoreCallback
[40]: https://github.com/EasyWebApp/WebCell-dashboard
[41]: https://github.com/EasyWebApp/WebCell-mobile
[42]: https://github.com/EasyWebApp/mark-wiki
[43]: https://web-cell.dev/cell-router/
[44]: https://bootstrap.web-cell.dev/
[45]: https://www.mdui.org/zh-cn/
[46]: https://tech-query.me/GitHub-Web-Widget/
[47]: https://web-cell.dev/KoAJAX/
[48]: https://web-cell.dev/web-utility/
[49]: https://web-cell.dev/iterable-observer/
[50]: https://github.com/EasyWebApp/Parcel-transformer-MDX
[51]: https://developer.chrome.com/docs/css-ui/declarative-shadow-dom?hl=zh-cn
[52]: https://legacy.reactjs.org/docs/react-api.html#reactlazy
