// @ts-check
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

function getModuleInfo(file) {
  const body = fs.readFileSync(file, 'utf-8')
  //转为AST
  const ast = parser.parse(body, { sourceType: 'module' })
  // 收集依赖
  const deps = {}
  traverse(ast, {
    ImportDeclaration: function (p) {
      const { node } = p
      const dirname = path.dirname(file);
      const absPath = path.join(dirname, node.source.value)
      deps[node.source.value] = absPath
    },
  })

  // 转换 ES6->ES5
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ['@babel/preset-env']
  })
  const moduleInfo = {
    file,
    deps,
    code
  }
  return moduleInfo
}

/**
 * 模块分析
 * @param {string} file 
 */
function parseModules(file) {
  const entry = getModuleInfo(file)
  const depArr = [entry]
  const depsGraph = {}
  getDeps(depArr, entry)
  depArr.forEach(moduleInfo => {
    const { file, deps, code } = moduleInfo
    depsGraph[file] = {
      deps,
      code
    }
  })
  return depsGraph
}

/**
 * 获取依赖
 * @param {any[]} depArr 
 * @param {*} param1 
 */
function getDeps(depArr, { deps }) {
  Object.keys(deps).forEach(key => {
    const child = getModuleInfo(deps[key])
    depArr.push(child)
    getDeps(depArr, child)
  })
}

function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file), null, 2)
  return `(function(graph){
    function require(file){
      function absRequire(relativePath){
        return require(graph[file].deps[relativePath])
      }
      var exports = {};
      (function(require,exports,code){
        eval(code)
      })(absRequire,exports,graph[file].code)
      return exports;
    }
    require(${JSON.stringify(file)})
  })(${depsGraph})`
}

/**
 * 
 * @param {string} entry 
 */
function start(entry) {
  const dist = path.join(__dirname, 'dist')
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist)
  }
  const content = bundle(entry)
  fs.writeFileSync(path.join(dist, 'bundle.js'), content)
  console.log('build done!');
}

const entry = path.join(__dirname, 'src/index.js')
start(entry)