# Web Cell

Light-weight **[Web Components](https://www.webcomponents.org/) engine** based on ECMAScript 6+, powered by the practice & experience from developing [EWA v1.0 ~ 4.0](https://gitee.com/Tech_Query/EasyWebApp/).

[![Join the chat at https://gitter.im/EasyWebApp-js/Lobby](https://badges.gitter.im/EasyWebApp-js/Lobby.svg)](https://gitter.im/EasyWebApp-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM Dependency](https://david-dm.org/EasyWebApp/WebCell.svg)](https://david-dm.org/EasyWebApp/WebCell)

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/web-cell/)



## Basic Usage


### Installation

```Shell
npm init

npm install web-cell babel-polyfill @webcomponents/webcomponentsjs

npm install web-cell-cli -D
```
(More about [WebCell DevCLI](https://easywebapp.github.io/DevCLI/))


### Configuration

Add **Source code folder** of your components to `directories.lib` field of `package.json` ([Example](https://github.com/EasyWebApp/BootCell/blob/master/package.json#L6))


### Index page

```HTML
<!DocType HTML>
<html><head>
    <script src="node_modules/babel-polyfill/dist/polyfill.min.js"></script>
    <script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
    <script src="node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>
    <script src="node_modules/web-cell/dist/web-cell.js"></script>

    <script src="dist/your-component.js"></script>
    <!-- More Script tags of your Web components -->
</head><body>
    <your-component></your-component>
</body></html>
```
(Set the directory of `index.html` into `directories.test` field of `package.json` for auto-preview during development)


### Component

Create [files as shown below](https://github.com/EasyWebApp/DevCLI/tree/master/test/example-js) in `path/to/your-component` directory:

`index.html`
```HTML
<template>
    <textarea onchange="${host.bubbleOut.bind( host )}">
        Hello, ${view.name}!
    </textarea>
</template>
```

`index.css`
```CSS
textarea {
    font-style: italic;
}
```

`index.json`
```JSON
{
    "name":  "Web components"
}
```

`index.js`
```JavaScript
import {component} from 'web-cell';

import template from './index.html';

import style from './index.css';

import data from './index.json';


export default  component(class YourComponent extends HTMLElement {

    constructor() {  super().buildDOM(template, style);  }

    static get data() {  return data;  }

    get value() {  return this.$('textarea')[0].value  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }
});
```

and then preview them during development with:
```Shell
web-cell preview
```

### Bundle

Bundle components to a package with JS modules in it:
```Shell
web-cell pack
```


## Integration

### webpack configuration

```Shell
npm install --save-dev \
    webpack webpack-cli \
    html-loader posthtml-loader \
    to-string-loader css-loader
```

`webpack.config.js`
```JavaScript
const path = require('path');

module.exports = {
    entry: 'path/to/your-component/index.js',
    output: {
        filename: 'your-component.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    'html-loader',
                    {
                        loader: 'posthtml-loader',
                        options: {
                            ident: 'posthtml'
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'to-string-loader',
                    'css-loader'
                ]
            }
        ]
    }
};
```
### Import to other frameworks

`your-component-wrapper.vue`
```HTML
<template>
    <your-component v-model="message"></your-component>
    <p>
        Text from Web component: {{message}}
    </p>
</template>

<script>
    import 'path/to/your-component';

    export default {
        data() {

            return  {message: 'Come from Vue!'};
        }
    }
</script>
```


## API document

 - Online --- https://web-cell.tk/ or `npm docs`

 - Offline --- `npm start`



## Component library

 1. [cell-router](https://easywebapp.github.io/cell-router/)

 2. [BootCell](https://github.com/EasyWebApp/BootCell) based on **BootStrap v4**

 3. [Material Cell](https://github.com/EasyWebApp/material-cell) based on **Material Design lite v1.3**
