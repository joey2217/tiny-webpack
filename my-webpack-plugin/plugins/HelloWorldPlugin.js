/**
 * Writing a Plugin
 * @link https://webpack.js.org/contribute/writing-a-plugin/
 */
class HelloWorldPlugin {
    constructor(options = {}) {
        console.log('HelloWorldPlugin options', options);
    }
    apply(compiler) {
        compiler.hooks.done.tap(
            'Hello World Plugin',
            (
                stats /* stats is passed as an argument when done hook is tapped.  */
            ) => {
                console.log('Hello HelloWorldPlugin!');
            }
        );
    }
}

module.exports = HelloWorldPlugin;