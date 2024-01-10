![WebCell logo](https://web-cell.dev/WebCell-0.f1ffd28b.png)

# WebCell

[Web Components][1] engine based on VDOM, [JSX][2], [MobX][3] & [TypeScript][4]

[![NPM Dependency](https://img.shields.io/librariesio/github/EasyWebApp/WebCell.svg)][5]
[![CI & CD](https://github.com/EasyWebApp/WebCell/actions/workflows/main.yml/badge.svg)][6]

[![Anti 996 license](https://img.shields.io/badge/license-Anti%20996-blue.svg)][7]
[![jaywcjlove/sb](https://jaywcjlove.github.io/sb/ico/awesome.svg)][8]

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
| view renderer |    [DOM renderer 2][17]    |       SnabbDOM       |          (built-in)           |          SnabbDOM (forked)          |
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

const Hello: FC<PropsWithChildren> = ({ children = 'World' }) => (
    <h1>Hello, {children}!</h1>
);

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
import { component, attribute, observer } from 'web-cell';

interface HelloProps {
    name?: string;
}

@component({ tagName: 'hello-world' })
@observer
class Hello extends HTMLElement {
    declare props: HelloProps;

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
    <button onClick={() => (couterStore.times += 1)}>
        Counts: {couterStore.times}
    </button>
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
                    href="https://unpkg.com/bootstrap@5.3.2/dist/css/bootstrap.min.css"
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
import { component, WebCell } from 'web-cell';

import styles from './scoped.css' assert { type: 'css' };

interface MyButton extends WebCell {}

@component({
    tagName: 'my-button',
    mode: 'open'
})
export class MyButton extends HTMLElement {
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
import { HTMLFieldProps } from 'web-utility';
import { WebField, component, formField, observer } from 'web-cell';

interface MyField extends WebField {}

@component({
    tagName: 'my-field',
    mode: 'open'
})
@formField
@observer
class MyField extends HTMLElement {
    declare props: HTMLFieldProps;

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

        <button>submit</button>
    </form>
);
```

### Async component

#### `AsyncTag.tsx`

```tsx
import { FC } from 'web-cell';

const AsyncTag: FC = () => <div>Async</div>;

export default AsyncTag;
```

#### `index.tsx`

```tsx
const AsyncTag = lazy(() => import('./AsyncTag'));

new DOMRenderer().render(<AsyncTag />);
```

## Node.js usage

### Tool chain

```shell
npm install jsdom element-internals-polyfill
```

### Polyfill

```js
import 'web-cell/polyfill';
```

## Basic knowledge

-   [Web components][23]
-   [Custom elements][24]
-   [Shadow DOM][25]
-   [Element Internals][26]
-   [CSS variables][27]
-   [ECMAScript 6+][28]
-   [TypeScript 5+][29]

## Life Cycle hooks

1.  [`connectedCallback`][30]
2.  [`disconnectedCallback`][31]
3.  [`attributeChangedCallback`][32]
4.  [`adoptedCallback`][33]
5.  [`updatedCallback`][34]
6.  [`formAssociatedCallback`][35]
7.  [`formDisabledCallback`][36]
8.  [`formResetCallback`][37]
9.  [`formStateRestoreCallback`][38]

## Scaffolds

1.  [Basic][39]
2.  [DashBoard][40]
3.  [Static site][41]

## Ecosystem

We recommend these libraries to use with WebCell:

-   **State management**: [MobX][42] (also powered by **TypeScript** & **Decorator**)
-   **Router**: [Cell Router][43]
-   **UI components**

    -   [BootCell][44] (based on **BootStrap v4**)
    -   [Material Cell][45] (based on **Material Design**)
    -   [GitHub Web Widget][46]

-   **HTTP request**: [KoAJAX][47] (based on **Koa**\-like middlewares)
-   **Utility**: [Web utility][48] (Methods & Types)
-   **Event stream**: [Iterable Observer][49] (**Observable** proposal)
-   **MarkDown integration**: [MarkCell][50] (**MDX** implement)

## Roadmap

-   [x] [Extend **Build-in Elements** with Virtual DOM][51]
-   [x] [Server-side Render][52]
-   [x] [Async Component loading][53]

## More guides

1.  [v2 to v3 migration][54]
2.  [Development contribution][55]

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
[11]: https://codesandbox.io/s/webcell-demo-9gyll?autoresize=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2FClock.tsx&theme=dark
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
[22]: https://web-cell.dev/scaffold/
[23]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[24]: https://developers.google.cn/web/fundamentals/web-components/customelements
[25]: https://developers.google.cn/web/fundamentals/web-components/shadowdom
[26]: https://web.dev/more-capable-form-controls/
[27]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables
[28]: http://es6-features.org/
[29]: https://www.typescriptlang.org/
[30]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#connectedCallback
[31]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#disconnectedCallback
[32]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#attributeChangedCallback
[33]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#adoptedCallback
[34]: https://web-cell.dev/WebCell/interfaces/WebCell.WebCellComponent.html#updatedCallback
[35]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formAssociatedCallback
[36]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formDisabledCallback
[37]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formResetCallback
[38]: https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formStateRestoreCallback
[39]: https://github.com/EasyWebApp/scaffold
[40]: https://github.com/EasyWebApp/DashBoard
[41]: https://github.com/EasyWebApp/mark-wiki
[42]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/
[43]: https://web-cell.dev/cell-router/
[44]: https://bootstrap.web-cell.dev/
[45]: https://material.web-cell.dev/
[46]: https://tech-query.me/GitHub-Web-Widget/
[47]: https://web-cell.dev/KoAJAX/
[48]: https://web-cell.dev/web-utility/
[49]: https://web-cell.dev/iterable-observer/
[50]: https://github.com/EasyWebApp/MarkCell
[51]: https://github.com/snabbdom/snabbdom/pull/829
[52]: https://web.dev/declarative-shadow-dom/
[53]: https://reactjs.org/docs/react-api.html#reactlazy
[54]: https://github.com/EasyWebApp/WebCell/blob/main/Migrating.md
[55]: https://github.com/EasyWebApp/WebCell/blob/main/Contributing.md
