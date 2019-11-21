![WebCell logo](https://web-cell.dev/image/WebCell-0.png)

# WebCell

[Web Components][1] engine based on [JSX][2] & [TypeScript][3]

[![Slideshow](https://img.shields.io/badge/learn-Slideshow-blue)][4]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][5]

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
export default class TestTag extends mixin() {
    @attribute
    @watch
    title = 'Test';

    @watch
    status = '';

    onClick = () => (this.title = 'Example');

    @on('click', ':host h1')
    onDelegate() {
        this.status = 'active';
    }

    render() {
        return (
            <h1 title={this.title} className={`title ${this.status}`}>
                <Fragment>
                    {this.title}
                    <img alt={this.title} onClick={this.onClick} />
                </Fragment>
                <SubTag />
            </h1>
        );
    }
}
```

### State management

We recommend [MobX][6], which is also powered by TypeScript & Decorator !

## Roadmap

-   [x] (Template) [Document Fragment node][7]

Go to [contribute](./Contributing.md)!

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
[4]: https://tech-query.me/programming/web-components-practise/slide.html
[5]: https://nodei.co/npm/web-cell/
[6]: https://github.com/EasyWebApp/WebCell/blob/v2/MobX/
[7]: https://github.com/Microsoft/TypeScript/issues/20469
