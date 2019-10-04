# MobX WebCell

[MobX][1] adaptor for [WebCell v2][2]

[![](https://data.jsdelivr.com/v1/package/npm/mobx-web-cell/badge?style=rounded)][3]

[![NPM](https://nodei.co/npm/mobx-web-cell.png?downloads=true&downloadRank=true&stars=true)][4]

## Installation

```shell
npm install web-cell mobx mobx-web-cell
```

## Usage

`source/model/index.ts`

```typescript
import { observable, action } from 'mobx';

class App {
    @observable
    count = 0;

    @action
    increase() {
        this.count++;
    }
}

export const app = new App();
```

`source/page/index.ts`

```jsx
import { createCell, component, mixin } from 'web-cell';
import { observer } from 'mobx-web-cell';

import { app } from '../model';

@observer
@component({
    tagName: 'page-index'
})
export default class PageIndex extends mixin() {
    render() {
        return <div onClick={app.increase}>count: {app.count}</div>;
    }
}
```

[1]: https://mobx.js.org
[2]: https://github.com/EasyWebApp/WebCell/tree/v2
[3]: https://www.jsdelivr.com/package/npm/mobx-web-cell
[4]: https://nodei.co/npm/mobx-web-cell/
