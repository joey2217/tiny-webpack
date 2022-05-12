// @ts-check
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const compilerSfc = require("@vue/compiler-sfc"); // .vue
const compilerDom = require("@vue/compiler-dom"); // 模板

const app = new Koa()

/**
 * @param {string} content 
 */
function rewriteImport(content) {
    return content.replace(/ from ['|"]([^'"]+)['|"]/g, function (m, p1) {
        console.log(m, p1);
        // . ../ ./开头的，都是相对路径
        if (p1[0] !== '.' && p1[1] !== '/') {
            return ` from '/@modules/${p1}'`
        }
        return m
    })
}

app.use(async ctx => {
    const {
        request: { url, query }
    } = ctx
    console.log('url:', url, 'query', query)
    if (url === '/') {
        ctx.type = 'text/html'
        let content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8')
        content = content.replace("<script", `
            <script>
                window.process = {env:{ NODE_ENV:'dev'}}
            </script>
            <script
        `)
        ctx.body = content
    } else if (url.endsWith('.js')) {
        ctx.type = 'application/javascript'
        const p = path.join(__dirname, url)
        const content = fs.readFileSync(p, 'utf-8')
        ctx.body = rewriteImport(content)
    } else if (url.startsWith('/@modules/')) { //TODO pnpm
        ctx.type = 'application/javascript'
        const moduleName = url.replace('/@modules/', '')
        const prefix = path.join(__dirname, 'node_modules', moduleName)
        const modulePackageJson = path.join(prefix, 'package.json')
        const module = require(modulePackageJson).module
        const p = path.resolve(prefix, module)
        const content = fs.readFileSync(p, 'utf-8')
        ctx.body = rewriteImport(content)
    } else if (url.endsWith('.css')) {
        const p = path.join(__dirname, url.slice(1))
        const file = fs.readFileSync(p, 'utf-8')
        const content = `
        const css = "${file.replace(/\n/g, '')}"
        let link = document.createElement('style')
        link.setAttribute('type', 'text/css')
        document.head.appendChild(link)
        link.innerHTML = css
        `
        ctx.type = 'application/javascript'
        ctx.body = content
    } else if (url.includes('.vue')) {
        const p = path.join(__dirname, url.split('?')[0].slice(1));
        console.log(p, '#######');
        const file = fs.readFileSync(p, 'utf-8')
        const { descriptor } = compilerSfc.parse(file)
        let content = ''
        if (descriptor.script) {
            content = descriptor.script.content
        } else if (descriptor.scriptSetup) {
            content = descriptor.scriptSetup.content
        }
        if (!query.type) {
            ctx.type = 'application/javascript'
            ctx.body = content ? `
            ${rewriteImport(
                content.replace("export default ", "const __script = ")
            )}
                import { render as __render } from "${url}?type=template";
                __script.render = __render;
                export default __script;
            `: 'unknown'
        } else {
            // 模板内容
            const template = descriptor.template;
            // 要在server端吧compiler做了
            const render = compilerDom.compile(template.content, { mode: "module" })
                .code;
            ctx.type = "application/javascript";
            ctx.body = rewriteImport(render)
        }

    } else {
        const content = fs.readFileSync(path.join(__dirname, 'public', url), 'utf-8')
        ctx.body = content
    }
})
app.listen(3000, () => {
    console.log('server start at http://localhost:3000');
})