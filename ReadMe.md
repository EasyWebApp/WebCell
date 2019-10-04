![WebCell logo](https://web-cell.dev/image/WebCell-0.png)

# WebCell

[Web Components][1] engine based on [JSX][2] & [TypeScript][3]

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)][4]

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
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.2.10/webcomponents-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.2.10/custom-elements-es5-adapter.js"></script>

<script src="source/SubTag.tsx"></script>
<script src="source/TestTag.tsx"></script>

<sub-tag></sub-tag>
<test-tag></test-tag>
```

### Simple component

[`source/SubTag.tsx`](test/source/SubTag.tsx)

```jsx
import { createCell, component, mixin } from 'web-cell';

export function InlineTag({ children }: any) {
    return <span>{children}</span>;
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
import { createCell, component, mixin, attribute, watch, on } from 'web-cell';

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
                {this.title}
                <img alt={this.title} onClick={this.onClick} />
                <SubTag />
            </h1>
        );
    }
}
```

## Roadmap

-   [ ] (Template) [Document Fragment node][5]

Go to [contribute](./Contributing.md)!

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
[4]: https://nodei.co/npm/web-cell/
[5]: https://github.com/Microsoft/TypeScript/issues/20469
