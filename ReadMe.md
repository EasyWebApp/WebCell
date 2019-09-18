# WebCell

[Web Components][1] engine based on [JSX][2] & [TypeScript][3]

## Usage

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
        "start": "parcel source/index.html",
        "build": "parcel build source/index.html"
    }
}
```

[`source/index.html`](test/index.html)

```html
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.2.10/webcomponents-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.2.10/custom-elements-es5-adapter.js"></script>

<script src="source/TestTag.tsx"></script>

<test-tag></test-tag>
```

### Simple component

[`source/TestTag.tsx`](test/source/TestTag.tsx)

```jsx
import * as WebCell from 'web-cell';

@WebCell.component({
    tagName: 'test-tag'
})
export default class TestTag extends WebCell.mixin() {
    render() {
        return (
            <h1 title="Test" class="title">
                Test
                <img alt="Test" />
            </h1>
        );
    }
}
```

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
