![WebCell logo](https://web-cell.dev/WebCell-0.f1ffd28b.png)

# WebCell

[Web Components][1] engine based on VDOM, [JSX][2], [MobX][12] & [TypeScript][3]

[![NPM Dependency](https://img.shields.io/librariesio/github/EasyWebApp/WebCell.svg)][4]
[![CI & CD](https://github.com/EasyWebApp/WebCell/actions/workflows/main.yml/badge.svg)][5]

[![Anti 996 license](https://img.shields.io/badge/license-Anti%20996-blue.svg)][6]
[![jaywcjlove/sb](https://jaywcjlove.github.io/sb/ico/awesome.svg)][7]

[![Slideshow](https://img.shields.io/badge/learn-Slideshow-blue)][8]
[![Gitter](https://badges.gitter.im/EasyWebApp/community.svg)][9]

[![Edit WebCell demo](https://codesandbox.io/static/img/play-codesandbox.svg)][10]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][11]

## Feature

### Engines comparison

|    feature    |      WebCell 3       |      WebCell 2       |             React             |                 Vue                 |
| :-----------: | :------------------: | :------------------: | :---------------------------: | :---------------------------------: |
|  JS language  |     TypeScript 5     |     TypeScript 4     |   ECMAScript or TypeScript    |      ECMAScript or TypeScript       |
|   JS syntax   | ES decorator stage-3 | ES decorator stage-2 |                               |                                     |
|  XML syntax   |      JSX import      |     JSX factory      |      JSX factory/import       | HTML/Vue template or JSX (optional) |
|    DOM API    |    Web components    |    Web components    |            HTML 5+            |               HTML 5+               |
| view renderer |    DOM renderer 2    |       SnabbDOM       |          (built-in)           |          SnabbDOM (forked)          |
|   state API   |  MobX `@observable`  |     `this.state`     | `this.state` or `useState()`  |       `this.$data` or `ref()`       |
|   props API   |  MobX `@observable`  |       `@watch`       | `this.props` or `props => {}` |  `this.$props` or `defineProps()`   |
| state manager |       MobX 6+        |       MobX 4/5       |             Redux             |                VueX                 |
|  page router  |       JSX tags       | JSX tags + JSON data |           JSX tags            |              JSON data              |
| asset bundler |       Parcel 2       |       Parcel 1       |            webpack            |                Vite                 |

## Usage

Demo & **GitHub template**: https://web-cell.dev/scaffold/

### Project bootstrap

#### Command

```shell
npm init -y
npm install dom-renderer mobx web-cell
npm install parcel -D
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
        "moduleResolution": "Node",
        "useDefineForClassFields": true,
        "jsx": "react-jsx",
        "jsxImportSource": "dom-renderer"
    }
}
```

#### `source/index.html`

```html
<script src="https://polyfill.web-cell.dev/feature/ECMAScript.js"></script>
<script src="https://polyfill.web-cell.dev/feature/WebComponents.js"></script>
<script src="https://polyfill.web-cell.dev/feature/ElementInternals.js"></script>

<script src="source/SubTag.tsx"></script>
<script src="source/TestTag.tsx"></script>

<sub-tag></sub-tag>
<test-tag></test-tag>
```

### Simple component

`source/SubTag.tsx`

```jsx
import { WebCellProps, component } from 'web-cell';

export function InlineTag({ children }: WebCellProps) {
    return <span>{children}</span>;
}

@component({
    tagName: 'sub-tag'
})
export class SubTag extends HTMLElement {
    render() {
        return <InlineTag>test</InlineTag>;
    }
}
```

### Advanced component

`source/TestTag.tsx`

```tsx
import { WebCellProps, component, attribute, observer, on } from 'web-cell';
import { observable } from 'mobx';

import { SubTag } from './SubTag';

export interface TestTagProps extends WebCellProps {
    topic?: string;
}

class State {
    @observable
    status = '';
}

@component({
    tagName: 'test-tag',
    mode: 'open'
})
@observer
export class TestTag extends WebCell<TestTagProps>() {
    @attribute
    @observable
    topic = 'Test';

    state = new State();

    onClick = () => (this.topic = 'Example');

    @on('click', ':host h1')
    onDelegate() {
        this.state.status = 'active';
    }

    render() {
        const { topic } = this,
            { status } = this.state;

        return (
            <>
                <style>
                    {stringifyCSS({
                        '.topic': {
                            color: 'lightblue'
                        },
                        '.topic.active': {
                            color: 'lightpink'
                        }
                    })}
                </style>

                <h1 title={topic} className={`topic ${status}`}>
                    {topic}
                    <img alt={topic} onClick={this.onClick} />

                    <SubTag />
                </h1>
            </>
        );
    }
}
```

## Basic knowledge

-   [Web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
-   [Custom elements](https://developers.google.cn/web/fundamentals/web-components/customelements)
-   [Shadow DOM](https://developers.google.cn/web/fundamentals/web-components/shadowdom)
-   [Element Internals](https://web.dev/more-capable-form-controls/)
-   [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables)
-   [ECMAScript 6+](http://es6-features.org/)
-   [TypeScript 5+][3]

## Life Cycle hooks

1. [`connectedCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#connectedCallback)

2. [`disconnectedCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#disconnectedCallback)

3. [`attributeChangedCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#attributeChangedCallback)

4. [`adoptedCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomElement.html#adoptedCallback)

5. [`updatedCallback`](https://web-cell.dev/WebCell/interfaces/WebCell.WebCellComponent.html#updatedCallback)

6. [`formAssociatedCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formAssociatedCallback)

7. [`formDisabledCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formDisabledCallback)

8. [`formResetCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formResetCallback)

9. [`formStateRestoreCallback`](https://web-cell.dev/web-utility/interfaces/DOM_type.CustomFormElement.html#formStateRestoreCallback)

## Scaffolds

1. [Basic](https://github.com/EasyWebApp/scaffold)

2. [DashBoard](https://github.com/EasyWebApp/DashBoard)

3. [Static site](https://github.com/EasyWebApp/mark-wiki)

## Ecosystem

We recommend these libraries to use with WebCell:

-   **State management**: [MobX][12] (also powered by **TypeScript** & **Decorator**)

-   **Router**: [Cell Router][13]

-   **UI components**

    -   [BootCell][14] (based on **BootStrap v4**)
    -   [Material Cell][15] (based on **Material Design**)
    -   [GitHub Web Widget][16]

-   **HTTP request**: [KoAJAX][17] (based on **Koa**-like middlewares)

-   **Utility**: [Web utility][18] (Methods & Types)

-   **Event stream**: [Iterable Observer][19] (**Observable** proposal)

-   **MarkDown integration**: [MarkCell][20] (**MDX** implement)

## Roadmap

-   [x] [Extend **Build-in Elements** with Virtual DOM](https://github.com/snabbdom/snabbdom/pull/829)
-   [x] [Server-side Render](https://web.dev/declarative-shadow-dom/)
-   [x] [Async Component loading](https://reactjs.org/docs/react-api.html#reactlazy)

## More guides

1. [v2 to v3 migration][21]
2. [Development contribution][22]

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
[4]: https://libraries.io/npm/web-cell
[5]: https://github.com/EasyWebApp/WebCell/actions/workflows/main.yml
[6]: https://github.com/996icu/996.ICU/blob/master/LICENSE
[7]: https://github.com/jaywcjlove/awesome-uikit
[8]: https://tech-query.me/programming/web-components-practise/slide.html
[9]: https://gitter.im/EasyWebApp/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
[10]: https://codesandbox.io/s/webcell-demo-9gyll?autoresize=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2FClock.tsx&theme=dark
[11]: https://nodei.co/npm/web-cell/
[12]: https://github.com/mobxjs/mobx/blob/mobx4and5/docs/
[13]: https://web-cell.dev/cell-router/
[14]: https://bootstrap.web-cell.dev/
[15]: https://material.web-cell.dev/
[16]: https://tech-query.me/GitHub-Web-Widget/
[17]: https://web-cell.dev/KoAJAX/
[18]: https://web-cell.dev/web-utility/
[19]: https://web-cell.dev/iterable-observer/
[20]: https://github.com/EasyWebApp/MarkCell
[21]: https://github.com/EasyWebApp/WebCell/blob/main/Migrating.md
[22]: https://github.com/EasyWebApp/WebCell/blob/main/Contributing.md
