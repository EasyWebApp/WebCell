import { arrayLike } from '../utility/object';


@arrayLike
/**
 * String template
 */
export default  class Template {
    /**
     * @param {string}          raw
     * @param {stirng[]}        [varName]  - Name list of the Local variable
     * @param {ChangedCallback} [onChange] - Call with New & Old value
     * @param {Array}           [bindData] - The parameter bound to `onChange`
     */
    constructor(raw, varName, onChange, bindData) {

        this.length = 0;

        this.raw = raw;

        /**
         * Last evaluated value
         *
         * @type {*}
         */
        this.value = null;

        if (varName instanceof Function)
            bindData = onChange, onChange = varName, varName = null;

        this.varName = varName || [ ];

        /**
         * Reference map of contexts
         *
         * @type {Map}
         */
        this.reference = new Map();

        for (let scope  of  ['this'].concat( this.varName ))
            this.reference.set(scope,  [ ]);

        this.onChange = (onChange instanceof Function)  ?  onChange  :  null;

        this.data = bindData || [ ];

        this.parse().clear();
    }

    /**
     * @type {RegExp}
     */
    static get Expression() {  return /\$\{([\s\S]+?)\}/g;  }

    /**
     * @type {RegExp}
     */
    static get Reference() {  return /(\w+)(?:\.(\w+)|\[(?:'([^']+)|"([^"]+)))/g;  }

    push() {  return  Array.prototype.push.apply(this, arguments);  }

    /**
     * @private
     *
     * @param {string} expression
     *
     * @return {number} Index of this Evaluation function
     */
    compile(expression) {

        this[ this.length++ ] = new Function(
            ... this.varName,  'return ' + expression.trim()
        );

        return  this.length - 1;
    }

    /**
     * @private
     *
     * @return {Template}
     */
    parse() {

        const addReference = (match, context, key1, key2, key3)  =>  {

            if (this.reference.has( context ))
                this.reference.get( context ).push(key1 || key2 || key3);
        };

        this.raw = this.raw.replace(
            Template.Expression,  (_, expression) => {

                expression.replace(Template.Reference, addReference);

                return  '${' + this.compile( expression ) + '}';
            }
        );

        return this;
    }

    /**
     * @private
     *
     * @param {number}  index
     * @param {?object} context
     * @param {Array}   [parameter]
     *
     * @return {*}
     */
    eval(index, context, parameter) {

        try {
            const value = this[ index ].apply(context, parameter);

            return  (value != null)  ?  value  :  '';

        } catch (error) {

            if (this.value !== null)  console.warn( error );

            return '';
        }
    }

    /**
     * Evaluate expression
     *
     * @param {?object} context     - Value of `this` in the expression
     * @param {...*}    [parameter] - One or more value of the Local variable
     *
     * @return {*}
     */
    evaluate(context, ...parameter) {

        const value = (this.raw !== '${0}')  ?
            this.raw.replace(
                /\$\{(\d+)\}/g,  (_, index) => this.eval(index, context, parameter)
            ) :
            this.eval(0, context, parameter);

        if (value !== this.value) {
            /**
             * Call back only on Value changed
             *
             * @typedef {function} ChangedCallback
             *
             * @param {*}    newValue
             * @param {*}    oldValue
             * @param {...*} bindData
             */
            if ( this.onChange )
                this.onChange(... [value, this.value].concat( this.data ));

            this.value = value;
        }

        return value;
    }

    /**
     * @return {string} Value evaluated with empty data
     */
    clear() {

        return  this.evaluate(... Array.from(
            this.reference.entries(),  entry => {

                const data = { };

                for (let key of entry[1])  data[ key ] = '';

                return data;
            }
        ));
    }

    toString() {  return  this.value + '';  }
}
