# WebCell

![WebCell logo](https://web-cell.dev/WebCell-0.f9823b00.png)

[简体中文](./guide/ReadMe-zh.md) | English

[Web Components][1] engine based on VDOM, [JSX][2], [MobX][3] & [TypeScript][4]

[![NPM Dependency](https://img.shields.io/librariesio/github/EasyWebApp/WebCell.svg)][5]
[![CI & CD](https://github.com/EasyWebApp/WebCell/actions/workflows/main.yml/badge.svg)][6]

[![Anti 996 license](https://img.shields.io/badge/license-Anti%20996-blue.svg)][7]
[![UI library recommendation list](https://jaywcjlove.github.io/sb/ico/awesome.svg)][8]

[![Slideshow](https://img.shields.io/badge/learn-Slideshow-blue)][9]
[![Gitter](https://badges.gitter.im/EasyWebApp/community.svg)][10]

[![Edit WebCell demo](https://codesandbox.io/static/img/play-codesandbox.svg)][11]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][12]

## Feature

### Engines comparison

|    feature    |         WebCell 3          |      WebCell 2       |             React             |                 Vue                 |
| :-----------: | :------------------------: | :------------------: | :---------------------------: | :---------------------------------: |
|  JS language  |     [TypeScript 5][13]     |     TypeScript 4     |   ECMAScript or TypeScript    |      ECMAScript or TypeScript       |
|   JS syntax   | [ES decorator stage-3][14] | ES decorator stage-2 |                               |                                     |
|  XML syntax   |      [JSX import][15]      |     JSX factory      |      JSX factory/import       | HTML/Vue template or JSX (optional) |
|    DOM API    |    [Web components][16]    |    Web components    |            HTML 5+            |               HTML 5+               |
| view renderer |    [DOM Renderer 2][17]    |       SnabbDOM       |          (built-in)           |          SnabbDOM (forked)          |
|   state API   |  [MobX `@observable`][18]  |     `this.state`     | `this.state` or `useState()`  |       `this.$data` or `ref()`       |
|   props API   |     MobX `@observable`     |       `@watch`       | `this.props` or `props => {}` |  `this.$props` or `defineProps()`   |
| state manager |       [MobX 6+][19]        |       MobX 4/5       |             Redux             |                VueX                 |
|  page router  |       [JSX][20] tags       | JSX tags + JSON data |           JSX tags            |              JSON data              |
| asset bundler |       [Parcel 2][21]       |       Parcel 1       |            webpack            |                Vite                 |

## Installation

```shell
npm install dom-renderer mobx web-cell
```

## Web browser usage

[Demo & **GitHub template**][22]

### Project bootstrap

#### Tool chain

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

### Function component

```tsx
import { DOMRenderer } from 'dom-renderer';
import { FC, PropsWithChildren } from 'web-cell';

const Hello: FC<PropsWithChildren> = ({ children = 'World' }) => <h1>Hello, {children}!</h1>;

new DOMRenderer().render(<Hello>WebCell</Hello>);
```

### Class component

#### Children slot

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
                Hello, <slot />!
            </h1>
        );
    }
}

new DOMRenderer().render(
    <>
        <Hello>WebCell</Hello>
        {/* or */}
        <hello-world>WebCell</hello-world>
    </>
);
```

#### DOM Props

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
        return <h1>Hello, {this.name}!</h1>;
    }
}

new DOMRenderer().render(<Hello name="WebCell" />);

// or for HTML tag props in TypeScript

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'hello-world': HelloProps;
        }
    }
}
new DOMRenderer().render(<hello-world name="WebCell" />);
```

### Inner state

#### Function component

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
    <button onClick={() => (couterStore.times += 1)}>Counts: {couterStore.times}</button>
));

new DOMRenderer().render(<Counter />);
```

#### Class component

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
        return <button onClick={this.handleClick}>Counts: {this.times}</button>;
    }
}

new DOMRenderer().render(<Counter />);
```

### CSS scope

#### Inline style

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

#### Link stylesheet

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
                    href="https://unpkg.com/bootstrap@5.3.6/dist/css/bootstrap.min.css"
                />
                <a className="btn">
                    <slot />
                </a>
            </>
        );
    }
}
```

#### CSS module

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

### Event delegation

```tsx
import { component, on } from 'web-cell';

@component({ tagName: 'my-table' })
export class MyTable extends HTMLElement {
    @on('click', ':host td > button')
    handleEdit(event: MouseEvent, { dataset: { id } }: HTMLButtonElement) {
        console.log(`editing row: ${id}`);
    }

    render() {
        return (
            <table>
                <tr>
                    <td>1</td>
                    <td>A</td>
                    <td>
                        <button data-id="1">edit</button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>B</td>
                    <td>
                        <button data-id="2">edit</button>
                    </td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>C</td>
                    <td>
                        <button data-id="3">edit</button>
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
        console.log(`newValue: ${newValue}, oldValue: ${oldValue}`);
    }

    render() {
        return <button onClick={this.handleClick}>Counts: {this.times}</button>;
    }
}
```

### Form association

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
            <input name={name} onChange={({ currentTarget: { value } }) => (this.value = value)} />
        );
    }
}

new DOMRenderer().render(
    <form method="POST" action="/api/data">
        <MyField name="test" />

        <button>submit</button>
    </form>
);
```

### Async component

```tsx
import { DOMRenderer } from 'dom-renderer';
import { observer, PropsWithChildren } from 'web-cell';
import { sleep } from 'web-utility';

const AsyncComponent = observer(async ({ children }: PropsWithChildren) => {
    await sleep(1);

    return <p>Async Component in {children}</p>;
});

new DOMRenderer().render(<AsyncComponent>WebCell</AsyncComponent>);
```

### Async loading

#### `AsyncTag.tsx`

```tsx
import { FC } from 'web-cell';

const AsyncTag: FC = () => <div>Async</div>;

export default AsyncTag;
```

#### `index.tsx`

```tsx
import { DOMRenderer } from 'dom-renderer';
import { lazy } from 'web-cell';

const AsyncTag = lazy(() => import('./AsyncTag'));

new DOMRenderer().render(<AsyncTag />);
```

### Async rendering (experimental)

#### DOM tree

```tsx
import { DOMRenderer } from 'dom-renderer';

new DOMRenderer().render(
    <a>
        <b>Async rendering</b>
    </a>,
    document.body,
    'async'
);
```

#### Class component

```tsx
import { component } from 'web-cell';

@component({
    tagName: 'async-renderer',
    renderMode: 'async'
})
export class AsyncRenderer extends HTMLElement {
    render() {
        return (
            <a>
                <b>Async rendering</b>
            </a>
        );
    }
}
```

### Animate CSS component

```tsx
import { DOMRenderer } from 'dom-renderer';
import { AnimateCSS } from 'web-cell';

new DOMRenderer().render(
    <AnimateCSS type="fadeIn" component={props => <h1 {...props}>Fade In</h1>} />
);
```

## Node.js usage

### Tool chain

```shell
npm install jsdom
```

### Polyfill

```js
import 'web-cell/polyfill';
```

### Server Side Rendering

https://github.com/EasyWebApp/DOM-Renderer?tab=readme-ov-file#nodejs--bun

## Basic knowledge

- [Web components][23]
- [Custom elements][24]
- [Shadow DOM][25]
- [Element Internals][26]
- [CSS variables][27]
- [View transitions][28]
- [ECMAScript 6+][29]
- [TypeScript 5+][4]

## Life Cycle hooks

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

## Scaffolds

1.  [Basic][22]
2.  [DashBoard][40]
3.  [Mobile][41]
4.  [Static site][42]

## Ecosystem

We recommend these libraries to use with WebCell:

- **State management**: [MobX][3] (also powered by **TypeScript** & **Decorator**)
- **Router**: [Cell Router][43]
- **UI components**
    - [BootCell][44] (based on **BootStrap v5**)
    - [MDUI][45] (based on **Material Design v3**)
    - [GitHub Web Widget][46]

- **HTTP request**: [KoAJAX][47] (based on **Koa**-like middlewares)
- **Utility**: [Web utility][48] methods & types
- **Event stream**: [Iterable Observer][49] (`Observable` proposal)
- **MarkDown integration**: [Parcel MDX transformer][50] (**MDX** Compiler plugin)

## Roadmap

- [x] [Server-side Render][51]
- [x] [Async Component loading][52]

## [v2 to v3 migration](./guide/Migrating.md)

## More guides

1.  [Development contribution](./guide/Contributing.md)

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
[23]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
[24]: https://web.dev/articles/custom-elements-v1
[25]: https://web.dev/articles/shadowdom-v1
[26]: https://web.dev/articles/more-capable-form-controls
[27]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
[28]: https://developer.chrome.com/docs/web-platform/view-transitions/
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
[45]: https://www.mdui.org/
[46]: https://tech-query.me/GitHub-Web-Widget/
[47]: https://web-cell.dev/KoAJAX/
[48]: https://web-cell.dev/web-utility/
[49]: https://web-cell.dev/iterable-observer/
[50]: https://github.com/EasyWebApp/Parcel-transformer-MDX
[51]: https://developer.chrome.com/docs/css-ui/declarative-shadow-dom
[52]: https://legacy.reactjs.org/docs/react-api.html#reactlazy
