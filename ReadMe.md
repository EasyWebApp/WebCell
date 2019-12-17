![WebCell logo](https://web-cell.dev/image/WebCell-0.png)

# WebCell

[Web Components][1] engine based on [JSX][2] & [TypeScript][3]

[![NPM Dependency](https://david-dm.org/EasyWebApp/WebCell.svg)][4]
[![Build Status](https://travis-ci.com/EasyWebApp/WebCell.svg?branch=v2)][5]
[![Slideshow](https://img.shields.io/badge/learn-Slideshow-blue)][6]

[![Edit WebCell scaffold](https://codesandbox.io/static/img/play-codesandbox.svg)][7]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][8]

## Usage

### Project bootstrap

Command

```shell
npm init -y
npm install web-cell@next
npm install parcel-bundler parcel-plugin-text -D
```

`package.json`

```json
{
    "scripts": {
        "start": "parcel source/index.html",
        "build": "parcel build source/index.html"
    },
    "parcel-plugin-text": {
        "extensions": ["css"]
    }
}
```

[`tsconfig.json`](./tsconfig.json)

[`source/index.html`](test/index.html)

```html
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.3.0/webcomponents-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.3.0/custom-elements-es5-adapter.js"></script>

<script src="source/SubTag.tsx"></script>
<script src="source/TestTag.tsx"></script>

<sub-tag></sub-tag>
<test-tag></test-tag>
```

### Simple component

[`source/SubTag.tsx`](test/source/SubTag.tsx)

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

[`source/TestTag.css`](test/source/TestTag.css)

```css
.title {
    color: lightblue;
}
.title.active {
    color: lightpink;
}
```

[`source/TestTag.tsx`](test/source/TestTag.tsx)

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

import style from './TestTag.css';
import { SubTag } from './SubTag';

interface Props {
    title?: string;
}

interface State {
    status: string;
}

@component({
    tagName: 'test-tag',
    style
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
            <Fragment>
                <h1 title={title} className={`title ${status}`}>
                    {title}
                    <img alt={title} onClick={this.onClick} />

                    <SubTag />
                </h1>
            </Fragment>
        );
    }
}
```

### Internationalization

`tsconfig.json`

```json
{
    "compilerOptions": {
        "module": "ESNext"
    }
}
```

`source/i18n/en-US.ts`

```typescript
export enum en_US {
    title = 'Test'
}

export type I18nMap = typeof en_US;
```

`source/i18n/zh-CN.ts`

```typescript
export enum zh_CN {
    title = '测试'
}
```

`source/index.tsx`

```javascript
import {
    createI18nScope,
    documentReady,
    render,
    createCell
} from 'web-cell';

import { I18nMap } from './i18n/en-US';

console.log(navigator.languages.includes('zh-CN')); // true

const { loaded, i18nTextOf } = createI18nScope<I18nMap>({
    'en-US': async () => (await import('./i18n/en-US')).en_US,
    'zh-CN': async () => (await import('./i18n/zh-CN')).zh_CN
}, 'en-US');

Promise.all([loaded, documentReady]).then(() =>
    render(<h1>{i18nTextOf('title')}</h1>); // <h1>测试</h1>
);
```

## Ecosystem

We recommend these libraries to use with WebCell:

-   **State management**: [MobX][9] (also powered by TypeScript & Decorator)

-   **Router**: [Cell Router][10] (based on MobX)

-   **UI components**

    -   [BootCell][11] (based on BootStrap v4)
    -   [GitHub Web Widget][12]

-   **HTTP request**: [KoAJAX][13] (based on Koa-like middlewares)

-   **Event stream**: [Iterable Observer][14]

## Roadmap

-   [x] (Template) [Document Fragment node][15]

Go to [contribute][16]!

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
[4]: https://david-dm.org/EasyWebApp/WebCell
[5]: https://travis-ci.com/EasyWebApp/WebCell
[6]: https://tech-query.me/programming/web-components-practise/slide.html
[7]: https://codesandbox.io/s/github/EasyWebApp/scaffold/tree/master/?autoresize=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2FClock.tsx&theme=dark
[8]: https://nodei.co/npm/web-cell/
[9]: https://github.com/EasyWebApp/WebCell/blob/v2/MobX
[10]: https://github.com/EasyWebApp/cell-router/tree/v2
[11]: https://web-cell.dev/BootCell/
[12]: https://tech-query.me/GitHub-Web-Widget/
[13]: https://web-cell.dev/KoAJAX/
[14]: https://web-cell.dev/iterable-observer/
[15]: https://github.com/Microsoft/TypeScript/issues/20469
[16]: https://github.com/EasyWebApp/WebCell/blob/v2/Contributing.md
