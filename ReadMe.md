![WebCell logo](https://web-cell.dev/WebCell-0.f1ffd28b.png)

# WebCell

[Web Components][1] engine based on [JSX][2] & [TypeScript][3]

[![NPM Dependency](https://david-dm.org/EasyWebApp/WebCell.svg)][4]
[![CI & CD](https://github.com/EasyWebApp/web-cell/workflows/CI%20&%20CD/badge.svg)][5]

[![Anti 996 license](https://img.shields.io/badge/license-Anti%20996-blue.svg)][6]
[![jaywcjlove/sb](https://jaywcjlove.github.io/sb/ico/awesome.svg)][7]

[![Slideshow](https://img.shields.io/badge/learn-Slideshow-blue)][8]
[![Gitter](https://badges.gitter.im/EasyWebApp/community.svg)][9]

[![Edit WebCell demo](https://codesandbox.io/static/img/play-codesandbox.svg)][10]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][11]

## Usage

Demo & **GitHub template**: https://web-cell.dev/scaffold/

### Project bootstrap

Command

```shell
npm init -y
npm install web-cell
npm install parcel-bundler -D
```

`package.json`

```json
{
    "scripts": {
        "start": "parcel source/index.html --open",
        "build": "parcel build source/index.html --public-url"
    }
}
```

[`tsconfig.json`](https://github.com/EasyWebApp/WebCell/blob/v2/tsconfig.json)

`source/index.html`

```html
<script
    crossorigin
    src="https://polyfill.app/api/polyfill?features=es.array.flat,es.object.from-entries"
></script>
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.5.0/webcomponents-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.5.0/custom-elements-es5-adapter.js"></script>
<script src="https://cdn.jsdelivr.net/npm/element-internals-polyfill@0.1.1/dist/index.min.js"></script>

<script src="source/SubTag.tsx"></script>
<script src="source/TestTag.tsx"></script>

<sub-tag></sub-tag>
<test-tag></test-tag>
```

### Simple component

`source/SubTag.tsx`

```jsx
import { createCell, component, mixin } from 'web-cell';

export function InlineTag({ defaultSlot }: any) {
    return <span>{defaultSlot}</span>;
}

@component({
    tagName: 'sub-tag',
    renderTarget: 'children'
})
export class SubTag extends mixin() {
    render() {
        return <InlineTag>test</InlineTag>;
    }
}
```

### Advanced component

`source/TestTag.tsx`

```jsx
import {
    createCell,
    component,
    mixin,
    attribute,
    watch,
    on,
    Fragment
} from 'web-cell';

import { SubTag } from './SubTag';

interface Props {
    title?: string;
}

interface State {
    status: string;
}

@component({
    tagName: 'test-tag',
    style: {
        '.title': {
            color: 'lightblue'
        },
        '.title.active': {
            color: 'lightpink'
        }
    }
})
export class TestTag extends mixin<Props, State>() {
    @attribute
    @watch
    title = 'Test';

    state = { status: '' };

    onClick = () => (this.title = 'Example');

    @on('click', ':host h1')
    onDelegate() {
        this.setState({ status: 'active' });
    }

    render({ title }: Props, { status }: State) {
        return (
            <>
                <h1 title={title} className={`title ${status}`}>
                    {title}
                    <img alt={title} onClick={this.onClick} />

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
-   [TypeScript 4+][3]

## Life Cycle hooks

1. [`connectedCallback`](https://web-cell.dev/web-utility/interfaces/customelement.html#connectedcallback)

2. [`disconnectedCallback`](https://web-cell.dev/web-utility/interfaces/customelement.html#disconnectedcallback)

3. [`attributeChangedCallback`](https://web-cell.dev/web-utility/interfaces/customelement.html#attributechangedcallback)

4. [`adoptedCallback`](https://web-cell.dev/web-utility/interfaces/customelement.html#adoptedcallback)

5. [`shouldUpdate`](https://web-cell.dev/WebCell/interfaces/webcellcomponent.html#shouldupdate)

6. [`updatedCallback`](https://web-cell.dev/WebCell/interfaces/webcellcomponent.html#updatedcallback)

7. [`formAssociatedCallback`](https://web-cell.dev/web-utility/interfaces/customformelement.html#formassociatedcallback)

8. [`formDisabledCallback`](https://web-cell.dev/web-utility/interfaces/customformelement.html#formdisabledcallback)

9. [`formResetCallback`](https://web-cell.dev/web-utility/interfaces/customformelement.html#formresetcallback)

10. [`formStateRestoreCallback`](https://web-cell.dev/web-utility/interfaces/customformelement.html#formstaterestorecallback)

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
    -   [Material Cell][15] (based on **Material Design** & **BootStrap v4**)
    -   [GitHub Web Widget][16]

-   **HTTP request**: [KoAJAX][17] (based on **Koa**-like middlewares)

-   **Utility**: [Web utility][18] (Methods & Types)

-   **Event stream**: [Iterable Observer][19] (**Observable** proposal)

-   **MarkDown integration**: [MarkCell][20] (**MDX** implement)

## Roadmap

-   [ ] [Extend **Build-in Elements** with Virtual DOM](https://github.com/snabbdom/snabbdom/pull/829)
-   [ ] [Server-side Render](https://web.dev/declarative-shadow-dom/)

Go to [contribute][21]!

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
[4]: https://david-dm.org/EasyWebApp/WebCell
[5]: https://github.com/EasyWebApp/web-cell/actions
[6]: https://github.com/996icu/996.ICU/blob/master/LICENSE
[7]: https://github.com/jaywcjlove/awesome-uikit
[8]: https://tech-query.me/programming/web-components-practise/slide.html
[9]: https://gitter.im/EasyWebApp/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
[10]: https://codesandbox.io/s/webcell-demo-9gyll?autoresize=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2FClock.tsx&theme=dark
[11]: https://nodei.co/npm/web-cell/
[12]: https://github.com/EasyWebApp/WebCell/blob/v2/MobX
[13]: https://web-cell.dev/cell-router/
[14]: https://bootstrap.web-cell.dev/
[15]: https://web-cell.dev/material-cell/
[16]: https://tech-query.me/GitHub-Web-Widget/
[17]: https://web-cell.dev/KoAJAX/
[18]: https://web-cell.dev/web-utility/
[19]: https://web-cell.dev/iterable-observer/
[20]: https://github.com/EasyWebApp/MarkCell
[21]: https://github.com/EasyWebApp/WebCell/blob/v2/Contributing.md
