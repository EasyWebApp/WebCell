# Integration


## webpack configuration

You can use `webpack` instead of `web-cell` command.

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


## Import to other frameworks

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
