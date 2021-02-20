## 使用 Webpack5 从 0 搭建 React开发环境

创建文件夹并进入：

```
$ mkdir tristana && cd tristana
```

初始化 `package.json`

```
$ npm init
```

安装 `Webpack`

```
$ npm install webpack webpack-cli --save-dev
```

创建以下目录结构、文件和内容：

### project

```
tristana
|- package.json
|- /dist
   |- index.html
|- /script
   |- webpack.config.js
|- index.html
|- /src
   |- index.js
```

### src/index.js

```
document.getElementById("root").append("React");
```

### index.html && dist/index.html

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>tristana</title>
    </head>
    <body>
        <script src="../src/index.js"></script>
        <div id="root"></div>
    </body>
</html>
```

### script/webpack.config.js

```
module.exports = {
    mode: "development",
    entry: "./src/index.js",
};
```

### package.json

```
{
    // ...
    "scripts": {
        "build": "webpack --mode=development --config script/webpack.config.js"
    },
}
```

然后根目录终端输入：`npm run build`

在浏览器中打开 `dist` 目录下的 `index.html`，如果一切正常，你应该能看到以下文本：`'React'`

`index.html` 目前放在 `dist` 目录下，但它是手动创建的，下面会教你如何生成 `index.html` 而非手动编辑它。

## Webpack 核心功能

### Babel

```
$ npm install @babel/cli @babel/core babel-loader @babel/preset-env --save-dev
```

#### script/webpack.config.js

```
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: "babel-loader",
                exclude: /node_modules/,
            },
        ],
    },
};
```

#### .babelrc

在根目录下添加 `.babelrc` 文件：

```
{
    "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

### 样式

```
$ npm install style-loader css-loader less less-loader --save-dev
```

#### script/webpack.config.js

```
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "less-loader",
                        lessOptions: {
                            javascriptEnabled: true,
                        },
                    },
                ],
            },
        ],
    },
};
```

### 图片字体

```
$ npm install file-loader --save-dev
```

#### script/webpack.config.js

```
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif|jpeg)$/,
                loader: 'file-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                loader: 'file-loader'
            }
        ],
    },
};
```

### HTML

```
$ npm install html-webpack-plugin --save-dev
```

#### script/webpack.config.js

```
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    // ...
    plugins: {
        html: new HtmlWebpackPlugin({
            title: 'tristana',
            template: 'public/index.html'
        }),
    }
};
```

#### index.html

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>tristana</title>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
```

### 开发服务

```
$ npm install webpack-dev-server --save-dev
```

#### script/webpack.config.js

```
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    // ...
    devServer: {
        contentBase: path.resolve(__dirname, "dist"),
        hot: true,
        historyApiFallback: true,
        compress: true,
    },
};
```

#### package.json

```
{
    // ...
    "scripts": {
        "start": "webpack serve --mode=development --config script/webpack.config.js"
    },
    // ...
}
```

### 清理 dist

```
$ npm install clean-webpack-plugin --save-dev
```

#### script/webpack.config.js

```
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    // ...
    plugins: {
        new CleanWebpackPlugin()
    }
};
```

#### Tips

由于 `webpack` 使用的是`^5.21.2` 版本，在使用该插件时，会提示`clean-webpack-plugin: options.output.path not defined. Plugin disabled...`，暂时还未解决。

### 环境变量

```
$ npm install cross-env --save-dev
```

#### package.json

```
{
    // ...
    "scripts": {
        "start": "cross-env ENV_LWD=development webpack serve  --mode=development --config script/webpack.config.js",
        "build": "cross-env ENV_LWD=production webpack --mode=production --config script/webpack.config.js"
    },
    // ...
}
```

## .jsx 文件

### 安装依赖

```
$ npm install @babel/preset-react react react-dom --save-dev
```

### .babelrc

```
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

### src/App.jsx

在 `src` 目录下，新增 `App.jsx` 文件：

```
import React, { Component } from "react";

class App extends Component {
    render() {
        return (
            <div>
                <h1> Hello, World! </h1>
            </div>
        );
    }
}

export default App;
```

### src/index.js

```
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
ReactDOM.render(<App />, document.getElementById("root"));
```

## React Router

### 安装依赖

```
$ npm install react-router history --save
```

### src/index.js

```
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Link } from "react-router";
import { createBrowserHistory } from "history";
import App from "./App.jsx";

const About = () => {
    return <>About</>;
};

ReactDOM.render(
    <Router history={createBrowserHistory()}>
        <Route path="/" component={App} />
        <Route path="/about" component={About} />
    </Router>,
    document.getElementById("root")
);
```

## MobX

### 安装依赖

```
$ npm install mobx mobx-react babel-preset-mobx --save
```

### .babelrc

```
{
  "presets": ["@babel/preset-env", "@babel/preset-react", "mobx"]
}
```

### src/store.js

在 `src` 目录下新建 `store.js`

```
import { observable, action, makeObservable } from "mobx";

class Store {

    constructor() {
        makeObservable(this);
    }

    @observable
    count = 0;

    @action("add")
    add = () => {
        this.count = this.count + 1;
    };

    @action("reduce")
    reduce = () => {
        this.count = this.count - 1;
    };
}
export default new Store();
```

### index.js

```
import { Provider } from "mobx-react";
import Store from "./store";
// ...
ReactDOM.render(
    <Provider store={Store}>
        <Router history={createBrowserHistory()}>
        <Route path="/" component={App} />
        <Route path="/about" component={About} />
        </Router>
    </Provider>,
    document.getElementById("root")
);
```

### src/App.jsx

```
import React, { Component } from "react";
import { observer, inject } from "mobx-react";

@inject("store")
@observer
class App extends Component {
    render() {
        return (
            <div>
                <div>{this.props.store.count}</div>
                <button onClick={this.props.store.add}>add</button>
                <button onClick={this.props.store.reduce}>reduce</button>
            </div>
        );
    }
}

export default App;
```

## Ant Design

### 安装依赖

```
$ npm install antd babel-plugin-import --save
```

### .babelrc

```
{
    // ...
    "plugins": [
        [
            "import",
            {
                "libraryName": "antd",
                "libraryDirectory": "es",
                "style": true
            }
        ]
    ]
}
```

### src/App.jsx

```
// ...
import { DatePicker } from "antd";
import "antd/dist/antd.css";

@inject("store")
@observer
class App extends Component {
    render() {
        return (
            <div>
                <DatePicker />
            </div>
        );
    }
}

export default App;
```

## TypeScript

### 安装依赖

```
$ npm install typescript @babel/preset-typescript --save-dev
```

### .babelrc

```
{
    "presets": [
        // ...
        "@babel/preset-typescript"
    ]
}
```

### tsconfig.json

在根目录下，新增 `tsconfig.json` 文件：

```
{
    "compilerOptions": {
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "target": "ES5",
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "allowJs": true,
        "outDir": "./dist/",
        "esModuleInterop": true,
        "noImplicitAny": false,
        "sourceMap": true,
        "module": "esnext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "importHelpers": true,
        "lib": ["esnext", "dom", "dom.iterable"],
        "skipLibCheck": true,
        "jsx": "react",
        "typeRoots": ["node", "node_modules/@types"],
        "rootDirs": ["./src"],
        "baseUrl": "./src"
    },
    "include": ["./src/**/*"],
    "exclude": ["node_modules"]
}
```

### src/App.jsx

更换文件后缀 `App.jsx` -> `App.tsx`

```
import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { DatePicker } from "antd";
import "antd/dist/antd.css";

@inject("store")
@observer
class App extends Component {
    props: any;
    render() {
        return (
            <div>
                <DatePicker />
                <div>{this.props.store.count}</div>
                <button onClick={this.props.store.add}>add</button>
                <button onClick={this.props.store.reduce}>reduce</button>
            </div>
        );
    }
}

export default App;
```

## 代码规范

代码校验、代码格式化、`Git` 提交前校验、`Vscode`配置、编译校验

### ESLint

#### 安装依赖

```
$ npm install @typescript-eslint/parser eslint eslint-plugin-standard @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-promise  --save-dev
```

#### .eslintrc.js

在根目录下，新增 `.eslintrc.js` 文件：

```
module.exports = {
    extends: ["eslint:recommended", "plugin:react/recommended"],
    env: {
        browser: true,
        commonjs: true,
        es6: true,
    },
    globals: {
        $: true,
        process: true,
        __dirname: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
            modules: true,
        },
        sourceType: "module",
        ecmaVersion: 6,
    },
    plugins: ["react", "standard", "promise", "@typescript-eslint"],
    settings: {
        "import/ignore": ["node_modules"],
        react: {
            version: "latest",
        },
    },
    rules: {
        quotes: [2, "single"],
        "no-console": 0,
        "no-debugger": 1,
        "no-var": 1,
        semi: ["error", "always"],
        "no-irregular-whitespace": 0,
        "no-trailing-spaces": 1,
        "eol-last": 0,
        "no-unused-vars": [
        1,
        {
            vars: "all",
            args: "after-used",
        },
        ],
        "no-case-declarations": 0,
        "no-underscore-dangle": 0,
        "no-alert": 2,
        "no-lone-blocks": 0,
        "no-class-assign": 2,
        "no-cond-assign": 2,
        "no-const-assign": 2,
        "no-delete-var": 2,
        "no-dupe-keys": 2,
        "use-isnan": 2,
        "no-duplicate-case": 2,
        "no-dupe-args": 2,
        "no-empty": 2,
        "no-func-assign": 2,
        "no-invalid-this": 0,
        "no-redeclare": 2,
        "no-spaced-func": 2,
        "no-this-before-super": 0,
        "no-undef": 2,
        "no-return-assign": 0,
        "no-script-url": 2,
        "no-use-before-define": 2,
        "no-extra-boolean-cast": 0,
        "no-unreachable": 1,
        "comma-dangle": 2,
        "no-mixed-spaces-and-tabs": 2,
        "prefer-arrow-callback": 0,
        "arrow-parens": 0,
        "arrow-spacing": 0,
        camelcase: 0,
        "jsx-quotes": [1, "prefer-double"],
        "react/display-name": 0,
        "react/forbid-prop-types": [
        2,
        {
            forbid: ["any"],
        },
        ],
        "react/jsx-boolean-value": 0,
        "react/jsx-closing-bracket-location": 1,
        "react/jsx-curly-spacing": [
        2,
        {
            when: "never",
            children: true,
        },
        ],
        "react/jsx-indent": ["error", 4],
        "react/jsx-key": 2,
        "react/jsx-no-bind": 0,
        "react/jsx-no-duplicate-props": 2,
        "react/jsx-no-literals": 0,
        "react/jsx-no-undef": 1,
        "react/jsx-pascal-case": 0,
        "react/jsx-sort-props": 0,
        "react/jsx-uses-react": 1,
        "react/jsx-uses-vars": 2,
        "react/no-danger": 0,
        "react/no-did-mount-set-state": 0,
        "react/no-did-update-set-state": 0,
        "react/no-direct-mutation-state": 2,
        "react/no-multi-comp": 0,
        "react/no-set-state": 0,
        "react/no-unknown-property": 2,
        "react/prefer-es6-class": 2,
        "react/prop-types": 0,
        "react/react-in-jsx-scope": 2,
        "react/self-closing-comp": 0,
        "react/sort-comp": 0,
        "react/no-array-index-key": 0,
        "react/no-deprecated": 1,
        "react/jsx-equals-spacing": 2,
    },
};
```

#### .eslintignore

在根目录下，新增 `.eslintignore` 文件：

```
src/assets
```

#### .vscode

在根目录下新增 `.vscode 文件夹`，然后新增 `.vscode/settings.json`

```
{
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    ]
}
```

### Perttier

#### 安装依赖

```
$ npm install prettier --save-dev
```

#### prettier.config.js

在根目录下，新增 `prettier.config.js` 文件：

```
module.exports = {
    // 一行最多 100 字符
    printWidth: 100,
    // 使用 4 个空格缩进
    tabWidth: 4,
    // 不使用缩进符，而使用空格
    useTabs: false,
    // 行尾需要有分号
    semi: true,
    // 使用单引号
    singleQuote: true,
    // 对象的 key 仅在必要时用引号
    quoteProps: 'as-needed',
    // jsx 不使用单引号，而使用双引号
    jsxSingleQuote: false,
    // 末尾不需要逗号
    trailingComma: 'none',
    // 大括号内的首尾需要空格
    bracketSpacing: true,
    // jsx 标签的反尖括号需要换行
    jsxBracketSameLine: false,
    // 箭头函数，只有一个参数的时候，也需要括号
    arrowParens: 'avoid',
    // 每个文件格式化的范围是文件的全部内容
    rangeStart: 0,
    rangeEnd: Infinity,
    // 不需要写文件开头的 @prettier
    requirePragma: false,
    // 不需要自动在文件开头插入 @prettier
    insertPragma: false,
    // 使用默认的折行标准
    proseWrap: 'preserve',
    // 根据显示样式决定 html 要不要折行
    htmlWhitespaceSensitivity: 'css',
    // 换行符使用 lf
    endOfLine: 'lf'
};
```

### stylelint

#### 安装依赖

```
$ npm install stylelint stylelint-config-standard stylelint-config-prettier --save-dev
```

#### stylelint.config.js

在根目录下，新增 `stylelint.config.js` 文件：

```
module.exports = {
    extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
    ignoreFiles: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.png',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.gif',
        '**/*.mp3',
        '**/*.json'
    ],
    rules: {
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: ['extends', 'ignores']
            }
        ],
        indentation: 4,
        'number-leading-zero': null,
        'unit-allowed-list': ['em', 'rem', 's', 'px', 'deg', 'all', 'vh', '%'],
        'no-eol-whitespace': [
            true,
            {
                ignore: 'empty-lines'
            }
        ],
        'declaration-block-trailing-semicolon': 'always',
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global']
            }
        ],
        'block-closing-brace-newline-after': 'always',
        'declaration-block-semicolon-newline-after': 'always',
        'no-descending-specificity': null,
        'selector-list-comma-newline-after': 'always',
        'selector-pseudo-element-colon-notation': 'single'
    }
};
```

### lint-staged、pre-commit

#### 安装依赖

```
$ npm install lint-staged prettier eslint pre-commit --save-dev
```

#### package.json

```
{
    // ...
    "scripts": {
        "lint:tsx": "eslint --ext .tsx src && eslint --ext .ts src",
        "lint:css": "stylelint --aei .less .css src",
        "precommit": "lint-staged",
        "precommit-msg": "echo 'Pre-commit checks...' && exit 0"
    },
    "pre-commit": [
        "precommit",
        "precommit-msg"
    ],
    "lint-staged": {
        "*.{js,jsx,ts,tsx}": [
            "eslint --fix",
            "prettier --write",
            "git add"
        ],
        "*.{css,less}": [
            "stylelint --fix",
            "prettier --write",
            "git add"
        ]
    }
}
```

### eslint-webpack-plugin

#### 安装依赖

```
$ npm install eslint-webpack-plugin --save-dev
```

#### script/webpack.config.js

```
const ESLintPlugin = require('eslint-webpack-plugin');
module.exports = {
    // ...
    plugins: [new ESLintPlugin()],
};
```

