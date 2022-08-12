# 如何解决React中的re-render问题

## re-render？

首先使用我的脚手架

```
npm i ykj-cli -g 
ykj init App
cd ./app
yarn 
yarn dev
```

这样一个webpack5、TS、React项目就搭建好了

我们目前只有一个APP组件，内部代码：

```
import Myy from './myy.jpg';

function App() {
    console.log('render')
    return (
        <div className="app">
            <h1>欢迎使用明源云 - 云空间前端通用脚手架</h1>
            <img src={Myy} alt="" style={{ width: 500, height: 500 }} />
            <h4>
                加入我们：<a>453089136@qq.com</a>
            </h4>
            <h4>微前端,webpack5,TypeScript,React,vite应有尽有</h4>
        </div>
    );
}

export default App;
```

刷新访问页面后，发现控制台只打印了一次

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

OK，那我们正式开始，加入一些状态，以及新增一个按钮和SubApp组件

```
import { useState } from 'react';
import Myy from './myy.jpg';
import SubApp from './SubApp'
function App() {
    const [state, setState] = useState("Peter");
    return (
        <div className="app">
            <h1>欢迎使用明源云 - 云空间前端通用脚手架</h1>
            <img src={Myy} alt="" style={{ width: 500, height: 500 }} />
            <h4>
                加入我们：<a>453089136@qq.com</a>
            </h4>
            <SubApp state={state} />
            <h4>微前端,webpack5,TypeScript,React,vite应有尽有</h4>
            <button onClick={() => {
                setState('关注公众号：前端巅峰')
            }}>测试按钮</button>
        </div>
    );
}

export default App;


//SubApp组件
function SubApp({ state }) {
    console.log('render')
    return <h1>{state}</h1>
}

export default SubApp
```

这个时候点击按钮，又触发了一次render

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

那么接下来我们继续点击按钮，看是否会继续render

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

多次点击，发现render只有一次，因为我们此时每次点击都是将state的值变成：`关注公众号：前端巅峰`这个字符串。

那么，我们尝试着将state变成一个对象

```
const [state, setState] = useState({ des: "Peter" });
  <button onClick={() => {
                setState({ des: '关注公众号：前端巅峰' })
            }}>测试按钮</button>
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

神奇的事情发生了，这里每次点击设置同样的state，都会触发子组件render. - 这里就出现了re-render问题，我们其实都是拿的同样的state,但是却出现了不必要的render

## 错误的优化

很多同学在使用React过程中会错误的使用PureComponent和useEffect以及UseMemo.

这里我们先用错误的方式引入useEffect,改造SubApp

```
import React, { useEffect, useState } from 'react';

function SubApp({ state }) {
    const [data, setData] = useState({})
    useEffect(() => {
        console.log('render')
        setData(state)
    }, [state])
    console.log('render')
    return <h1>{data.des}</h1>
}

export default SubApp
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

这里可以看到，每次点击按钮都在不断render，使用了useEffect竟然失效了。这优化无效~

这里就要谈到useEffect的源码实现，其实useEffect和PureComponent等一系列优化手段，大都是使用了`Object.is()`这个算法。

MDN资料地址：`https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is`

## Object.is

- Object.is() 方法判断两个值是否为同一个值。

```
value1
被比较的第一个值。
value2
被比较的第二个值。
返回值
一个 Boolean 类型标示两个参数是否是同一个值。

描述
Object.is() 方法判断两个值是否为同一个值。如果满足以下条件则两个值相等:

都是 undefined
都是 null
都是 true 或 false
都是相同长度的字符串且相同字符按相同顺序排列
都是相同对象（意味着每个对象有同一个引用）
都是数字且
都是 +0
都是 -0
都是 NaN
或都是非零而且非 NaN 且为同一个值
与== (en-US) 运算不同。== 运算符在判断相等前对两边的变量(如果它们不是同一类型) 进行强制转换 (这种行为的结果会将 "" == false 判断为 true), 而 Object.is不会强制转换两边的值。

与=== (en-US) 运算也不相同。=== 运算符 (也包括 == 运算符) 将数字 -0 和 +0 视为相等 ，而将Number.NaN 与NaN视为不相等.
```

## 合理使用useEffect,解决re-render

如果Props传入的是一个对象，那么由于React hooks每次更新都会生成一个全新的对象，而这个全新的对象和之前的对象，无法通过Object.is去对比，每次都会不相等。例如：

```
  const obj1 = {
            name: "peter"
        }
        const obj2 = {
            name: "peter"
        }

        console.log(Object.is(obj1, obj2, 'xx'))
```

这段代码永远输出都是`false`,因为obj1和obj2是两个不同地址的引用对象

但是如果我们换一种方式：

```
Object.is(obj1.name, obj2.name )
```

这样就可以正常比较，永远输出`ture`了

那么我们现在也要在`useEffect`中类似这样使用

```
    useEffect(() => {
        setData(state)
        console.log('render')
    }, [state.des])
```

这样我们的useEffect内部回调只会被触发一次

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

## 加餐，简单实现useEffect

网上抄的代码改造了比较方法

```
let _deps;
function useEffect(callback, dependencies) {
  const hasChanged = _deps
    && !dependencies.every((el, i) =>Object.is( el ,_deps[i]))
    || true;
  // 如果 dependencies 不存在，或者 dependencies 有变化，就执行 callback
  if (!dependencies || hasChanged) {
    callback();
    _deps = dependencies;
  }
}
```

实现逻辑：将传入的依赖项遍历，通过Object.is方法与原依赖项的值进行浅对比，如果不一致就执行callback。

所以在解决re-render问题时，或者使用useEffect之类优化方案时，应该监听对比某个值，而不是去监听某个大对象进行对比。相信这篇文章能解决你心中疑惑很久的re-render问题，如果感觉写得不错的话，帮忙来个`赞、