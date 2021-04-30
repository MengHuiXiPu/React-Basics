什么是useeffect
该hook接收一个包含命令式，且可能有副作用代码的函数，在函数组件主体内（渲染阶段）改变DOM，添加订阅，设置定时器，记录日志以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的bug并且会破坏UI的一致性，使用useeffect完成副作用操作，赋值给useeffect的函数会在组件渲染到屏幕之后执行，可以把effect看作从react的纯函数世界通往外界命令世界的通道。

import React, { usestate, useEffect } from 'react'
function Example() {
    const [count, setCount] = usestate(0)
    useEffect(() => {
        document.title = `you clicked ${count} times`
    }))
    retur(
        <div>
            <p>you clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                clicked me
            </button>

        </div>
    )
}

useffect做了什么呢？
通过使用这个Hook,你可以告诉React组件需要在渲染后执行某些操作。React会保存你传递的函数（我们称之为effect）
并且在执行DOM更新之后调用它，在这个effect中，我们设置了document的title 属性 

为什么在组件内部调用useeffect
将useEffect 放在组件内部让我们可以在effect中直接访问countstate 变量（或者其他state）,我们不需要特殊的API来读取它，它已经保存在函数的作用域中，Hook使用了JS的闭包机制，而不用在JS已经提供了解决方案的情况下，还引入特定的React 我们不需要特殊的API来读取它，它已经保存在函数的作用域中，Hook使用了JS的闭包机制，而不用在JS已经提供了解决方案的情况下，还引入特定的Reactapi

UseEffect 会在每次渲染后执行吗？
是的 ，默认情况下，它在第一次渲染之后和每次更新之后都会执行，，你可能会更容易接收effect发生在‘渲染之后’这种概念，不用再考虑挂在还是更新了。react保证每次运行effect的同时，DOM都已经更新完毕，如果你熟悉 React class 的生命周期函数，你可以把useeffect Hook 看作是componentDidMount,componentDidUpdate 和componentWillUnmount这三个函数的组合
