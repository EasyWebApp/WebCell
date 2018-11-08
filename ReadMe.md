![WebCell logo](https://web-cell.tk/image/WebCell.svg)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FEasyWebApp%2FWebCell.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FEasyWebApp%2FWebCell?ref=badge_shield)

# WebCell

Light-weight **[Web Components](https://www.webcomponents.org/) engine** (with MVVM support) based on [ECMAScript 2018][1] & [Decorator proposal][2], powered by the practice & experience from developing [EWA v1.0 ~ 4.0](https://gitee.com/Tech_Query/EasyWebApp/).

[![Join the chat at https://gitter.im/EasyWebApp-js/Lobby](https://badges.gitter.im/EasyWebApp-js/Lobby.svg)](https://gitter.im/EasyWebApp-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM Dependency](https://david-dm.org/EasyWebApp/WebCell.svg)](https://david-dm.org/EasyWebApp/WebCell)

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/web-cell/)



## Basic knowledge

 1. [Web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

 2. [Custom elements](https://developers.google.com/web/fundamentals/web-components/customelements)

 3. [Shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom)

 4. [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables)

 5. [ECMAScript 6+](http://es6-features.org/)

 6. [Decorator](https://github.com/tc39/proposal-decorators#decorators)



## Basic Usage


### Quick start

```Shell
# Only first time in a computer
npm install web-cell-cli -g --production

mkdir my_project  &&  cd my_project

web-cell boot
```
(More configuration & template files can be found in the document of [WebCell DevCLI](https://easywebapp.github.io/DevCLI/))


### Component

Create [files as shown below](https://github.com/EasyWebApp/DevCLI/tree/master/test/example-js) in `path/to/your-component` directory:

`index.html`
```HTML
<template>
    <textarea onchange="${host.bubbleOut.bind( host )}">
        Hello, ${view.name}!
    </textarea>
    <img src="${host.constructor.icon}">
    <table>
        <tbody data-array="specification"><template>
            <tr>
                <td>${view.index}</td><td>${view.name}</td>
            </tr>
        <template></tbody>
    </table>
    <slot></slot>
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
    "name":           "Web components",
    "specification":  [
        {"name": "HTML 5.3"},
        {"name": "DOM 4.1"},
        {"name": "ECMAScript 2018"},
        {"name": "Decorator proposal"}
    ]
}
```

`icon.svg`
```XML
<svg></svg>
```

`index.js`
```JavaScript
import { component, blobURI, mapProperty, mapData } from 'web-cell';

import template from './index.html';

import style from './index.css';

import data from './index.json';

import icon from './icon.svg';


@component({                 //  Register this class as a Custom Element,
    template, style, data    //  then define static properties
})
export default  class YourComponent extends HTMLElement {

    constructor() {

        super();

        this.buildDOM();    //  This method is necessary when template is set
    }

    @blobURI    //  Convert Data URL to Object URL, then cache it
    static get icon() {  return icon;  }

    @mapProperty    //  Assign parsed value of Attribute to Property with the same name
    static get observedAttributes() {  return ['value', 'name'];  }

    @mapData    //  Assign Property value to Data with the same name
    attributeChangedCallback() { }

    /**
     * Do something after Outside nodes changing
     *
     * @param {Node[]}          assigned - Nodes pluged into a slot
     * @param {HTMLSlotElement} slot
     * @param {?String}         name     - `name` attribute of `slot`
     */
    slotChangedCallback(assigned, slot, name) { }

    /**
     * @param {Object} newData
     * @param {Object} oldData
     *
     * @return {?Boolean} `false` can prevent the view of this Component to rerender
     */
    viewUpdateCallback(newData, oldData) { }

    get value() {  return this.$('textarea')[0].value  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }
}
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

 3. [Material Cell](https://web-cell-ht.ml/) based on **Material Design lite v1.3**



## Standard specification

 1. [HTML 5.3](https://www.w3.org/TR/html53/)

 2. [DOM 4.1](https://www.w3.org/TR/dom41/)

 3. [CSS variables](https://www.w3.org/TR/css-variables-1/)

 4. [ECMAScript 2018][1]

 5. [Decorator proposal][2]



[1]: https://www.ecma-international.org/publications/standards/Ecma-262.htm

[2]: https://tc39.github.io/proposal-decorators/


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FEasyWebApp%2FWebCell.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FEasyWebApp%2FWebCell?ref=badge_large)