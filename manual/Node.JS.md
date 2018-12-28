# Node.JS like environment

**WebCell** can run in any *Non-browser* environment which supports **CommonJS** or **ECMAScript module** based on [**JSDOM**](https://github.com/jsdom/jsdom).



## Import

```Shell
npm install web-cell jsdom node-fetch
```
Add these `import` before any **Non-inset packages**:

```JavaScript
import 'regenerator-runtime/runtime';          //  Export `regeneratorRuntime` to `global`

import JSDOM from 'web-cell/dist/polyfill';    //  Export `self` & some DOM API to `global`

import * as WebCell from 'web-cell';
```


## Typical cases

 1. [**WebCell DevCLI**](https://web-cell.tk/DevCLI/) uses [DOM utility](https://web-cell.tk/WebCell/file/source/utility/DOM.js.html) methods of WebCell
