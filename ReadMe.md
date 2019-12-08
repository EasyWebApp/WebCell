![WebCell logo](https://web-cell.dev/image/WebCell-0.png)

# WebCell

[Web Components][1] engine based on [JSX][2] & [TypeScript][3]

[![NPM Dependency](https://david-dm.org/EasyWebApp/WebCell.svg)][4]
[![Slideshow](https://img.shields.io/badge/learn-Slideshow-blue)][5]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][6]

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

@component({
    tagName: 'test-tag',
    style
})
export class TestTag extends mixin<{ title?: string }, { status: string }>() {
    @attribute
    @watch
    title = 'Test';

    state = { status: '' };

    onClick = () => (this.title = 'Example');

    @on('click', ':host h1')
    onDelegate() {
        this.setState({ status: 'active' });
    }

    render() {
        const { status } = this.state;

        return (
            <Fragment>
                <h1 title={this.title} className={`title ${status}`}>
                    {this.title}
                    <img alt={this.title} onClick={this.onClick} />
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
        "module": "esnext",
        "moduleResolution": "node",
        "allowSyntheticDefaultImports": false,
        "resolveJsonModule": true
    }
}
```

[`source/index.tsx`](test/source/index.tsx)

```javascript
import {
    setI18n,
    documentReady,
    render,
    createCell
} from 'web-cell';

console.log(navigator.languages.includes('zh-CN')); // true

Promise.all([
    setI18n({ 'zh-CN': () => import('./i18n/zh-CN.json') }),
    documentReady
]).then(() =>
    render(<h1 i18n>Sample</h1>); // <h1>样本</h1>
);
```

## Ecosystem

We recommend these libraries to use with WebCell:

-   **State management**: [MobX][7] (also powered by TypeScript & Decorator)

-   **Router**: [Cell Router][8] (based on MobX)

-   **UI components**: [BootCell][9] (based on BootStrap v4)

-   **HTTP request**: [KoAJAX][10] (based on Koa-like middlewares)

-   **Event stream**: [Iterable Observer][11]

## Roadmap

-   [x] (Template) [Document Fragment node][12]

Go to [contribute][13]!

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
[4]: https://david-dm.org/EasyWebApp/WebCell
[5]: https://tech-query.me/programming/web-components-practise/slide.html
[6]: https://nodei.co/npm/web-cell/
[7]: https://github.com/EasyWebApp/WebCell/blob/v2/MobX
[8]: https://github.com/EasyWebApp/cell-router/tree/v2
[9]: https://web-cell.dev/BootCell/
[10]: https://web-cell.dev/KoAJAX/
[11]: https://web-cell.dev/iterable-observer/
[12]: https://github.com/Microsoft/TypeScript/issues/20469
[13]: https://github.com/EasyWebApp/WebCell/blob/v2/Contributing.md
