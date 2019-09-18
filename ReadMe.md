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

<script src="source/SubTag.tsx"></script>
<script src="source/TestTag.tsx"></script>

<sub-tag></sub-tag>
<test-tag></test-tag>
```

### Simple component

[`source/SubTag.tsx`](test/source/SubTag.tsx)

```jsx
import * as WebCell from 'web-cell';

export function InlineTag() {
    return <span />;
}

@WebCell.component({
    tagName: 'sub-tag'
})
export class SubTag extends WebCell.mixin() {
    render() {
        return (
            <div>
                <InlineTag />
            </div>
        );
    }
}
```

### Advanced component

[`source/TestTag.tsx`](test/source/TestTag.tsx)

```jsx
import * as WebCell from 'web-cell';

import { SubTag } from './SubTag';

@WebCell.component({
    tagName: 'test-tag'
})
export default class TestTag extends WebCell.mixin() {
    @WebCell.watch
    title = 'Test';

    onClick = () => (this.title = 'Example');

    render() {
        return (
            <h1 title={this.title} class="title">
                {this.title}
                <img alt={this.title} onclick={this.onClick} />
                <SubTag />
            </h1>
        );
    }
}
```

[1]: https://www.webcomponents.org/
[2]: https://facebook.github.io/jsx/
[3]: https://www.typescriptlang.org
