# Router & Shared state


## Create an App

[More details](https://web-cell.tk/DevCLI/)

```Shell
npm init web-cell path/to/your_project \
    --app \
    --remote https://git-example.com/your_id/repo_name.git
```


## Create a Router component

[More details](https://web-cell.tk/cell-router/)

`source/app-router/index.js`

```JavaScript
import { component } from 'web-cell';

import HTMLRouter, { load, back } from 'cell-router';

import App from '../scheme/App';    //  Small app may not need this


@component({ store: App })
export default  class AppRouter extends HTMLRouter {

    @load('/index')
    indexPage() {  return '<page-index />';  }

    @load('/secret/1')
    secretPage(id) {  return `<h1>Secret ${id}</h1>`;  }

    @back('/secret')
    keepSecret() {  return !!this.store.user;  }
}
```


## Define a Shared state

[More details](https://tech-query.me/DataScheme/)

`source/scheme/App.js`

```JavaScript
import Model, { mapGetter, is } from 'data-scheme';

import User from './User';


@mapGetter
export default  class App extends Model {

    @is( User )
    set user(value) {  this.set('user', value);  }
}
```

`source/scheme/User.js`

```JavaScript
import Model, { mapGetter, is, Range, Email, Phone, URL } from 'data-scheme';


@mapGetter
export default  class User extends Model {

    @is(/^[\w-]{3,20}$/, '')
    set name(value) {  this.set('name', value);  }

    @is(Email, '')
    set email(value) {  this.set('email', value);  }

    @is( Phone )
    set phone(value) {  this.set('phone', value);  }

    @is([0, 1, 2],  2)
    set gender(value) {  this.set('gender', value);  }

    @is(Range( 1900 ))
    set birthYear(value) {  this.set('birthYear', value);  }

    @is(URL, 'http://example.com/test.jpg')
    set avatar(value) {  this.set('avatar', value);  }

    @is( URL )
    set URL(value) {  this.set('URL', value);  }

    @is( String )
    set description(value) {  this.set('description', value);  }
}
```
