/**
 * 模拟exports
 */
// const exports = {}
// eval(`exports.default = function (a,b) {
//     return a+b
// }`)
// exports.default(1, 3)

const exports = {}
    (function (exports, code) {
        eval(code)
    })(exports, `exports.default = function (a,b) { return a+b}`)

    /**
     * 模拟require
     */
    // function require(file) {
    //     const exports = {}
    //         (function (exports, code) {
    //             eval(code)
    //         })(exports, `exports.default = function(a,b){return a+b}`)
    //     return exports
    // }

    // const add = require('add.js').default
    // console.log(add(1, 2));

    (function (list) {
        function require(file) {
            const exports = {}
                (function (exports, code) {
                    eval(code)
                })(exports, list[file])
            return exports
        }
        require('index.js')
    })({
        'index.js': `
    const add = require('add.js').default
    console.log(add(1,2))
    `,
        'add.js': 'exports.default = function(a,b){return a+b}'
    })
