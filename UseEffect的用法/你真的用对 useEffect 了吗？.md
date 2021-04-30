## 你真的用对 useEffect 了吗？

## 1.什么是useEffect？

> 该 Hook 接收一个包含命令式、且可能有副作用代码的函数。
> 在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的 bug 并破坏 UI 的一致性。使用 useEffect 完成副作用操作。赋值给 useEffect 的函数会在组件渲染到屏幕之后执行。你可以把 effect 看作从 React 的纯函数式世界通往命令式世界的逃生通道。(官方文档)

这么一看你也许会有点不明白...
看下面这个例子：

```
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
复制代码
```

**useEffect 做了什么？**
通过使用这个 Hook，你可以告诉 React 组件需要在渲染后执行某些操作。React 会保存你传递的函数（我们将它称之为 “effect”），并且在执行 DOM 更新之后调用它。在这个 effect 中，我们设置了 document 的 title 属性，不过我们也可以执行数据获取或调用其他命令式的 API。

**为什么在组件内部调用 useEffect？**
将 useEffect 放在组件内部让我们可以在 effect 中直接访问 count state 变量（或其他 props）。我们不需要特殊的 API 来读取它 —— 它已经保存在函数作用域中。Hook 使用了 JavaScript 的闭包机制，而不用在 JavaScript 已经提供了解决方案的情况下，还引入特定的 React API。

**useEffect 会在每次渲染后都执行吗？**
是的，默认情况下，它在第一次渲染之后和每次更新之后都会执行。（我们稍后会谈到如何控制它。）你可能会更容易接受 effect 发生在“渲染之后”这种概念，不用再去考虑“挂载”还是“更新”。React 保证了每次运行 effect 的同时，DOM 都已经更新完毕 如果你熟悉 React class 的生命周期函数，你可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。

## 2.如何使用useEffect

### 2.1实现componentDidMount 的功能

useEffect的第二个参数为一个空数组，初始化调用一次之后不再执行，相当于componentDidMount。

```
function Demo () {
  useEffect(() => {
    console.log('hello world')
  }, [])
  return (
    <div>
      hello world
    </div>
  )
}
// 等价于
class Demo extends Component {
  componentDidMount() {
    console.log('hello world')
  }
  render() {
    return (
      <div>
        hello world
      </div>
    );
  }
}
复制代码
```

### 2.2实现组合 componentDidMount componentDidUpdate 的功能

当useEffect没有第二个参数时,组件的初始化和更新都会执行。

```
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  componentDidMount() {
    document.title = `You clicked ${this.state.count} times`;
  }

  componentDidUpdate() {
    document.title = `You clicked ${this.state.count} times`;
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
// 等价于
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

复制代码
```

### 2.3实现组合 componentDidMount componentWillUnmount 的功能

useEffect返回一个函数，这个函数会在组件卸载时执行。

```
class Example extends Component {
  constructor (props) {
    super(props);
    this.state = {
      count: 0
    }
  }
  componentDidMount() {
    this.id = setInterval(() => {
      this.setState({count: this.state.count + 1})
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.id)
  }
  render() { 
    return <h1>{this.state.count}</h1>;
  }
}
// 等价于
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>hello world</h1>
}
复制代码
```

## 3.useEffect使用的坑

### 3.1 无限循环

**当useEffect的第二个参数传数组传一个依赖项，当依赖项的值发生变化，都会触发useEffect执行。**
请看下面的例子：

App组件显示了一个项目列表，状态和状态更新函数来自与useState这个hooks，通过调用useState，来创建App组件的内部状态。初始状态是一个object，其中的hits为一个空数组，目前还没有请求后端的接口。

```
import React, { useState } from 'react';
 
function App() {
  const [data, setData] = useState({ hits: [] });
 
  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}
 
export default App;
复制代码
```

为了获取后端提供的数据，接下来将使用axios来发起请求，同样也可以使用fetch，这里会使用useEffect来隔离副作用。

```
import React, { useState, useEffect } from 'react';
import axios from 'axios';
 
function App() {
  const [data, setData] = useState({ hits: [] });
 
  useEffect(async () => {
    const result = await axios(
      'http://localhost/api/v1/search?query=redux',
    );
 
    setData(result.data);
  });
 
  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}
 
export default App;
复制代码
```

在useEffect中，不仅会请求后端的数据，还会通过调用setData来更新本地的状态，这样会触发view的更新。

但是，运行这个程序的时候，会出现无限循环的情况。useEffect在组件mount时执行，但也会在组件更新时执行。因为我们在每次请求数据之后都会设置本地的状态，所以组件会更新，因此useEffect会再次执行，因此出现了无限循环的情况。我们只想在组件mount时请求数据。我们可以传递一个空数组作为useEffect的第二个参数，这样就能避免在组件更新执行useEffect，只会在组件mount时执行。

```
import React, { useState, useEffect } from 'react';
import axios from 'axios';
 
function App() {
  const [data, setData] = useState({ hits: [] });
 
  useEffect(async () => {
    const result = await axios(
      'http://localhost/api/v1/search?query=redux',
    );
 
    setData(result.data);
  }, []);
 
  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}
 
export default App;
复制代码
```

useEffect的第二个参数可用于定义其依赖的所有变量。如果其中一个变量发生变化，则useEffect会再次运行。如果包含变量的数组为空，则在更新组件时useEffect不会再执行，因为它不会监听任何变量的变更。

再看这个例子：
业务场景：需要在页面一开始时得到一个接口的返回值，取调用另一个接口。
我的思路是，先设置这个接口的返回值为data=[], 等到数据是再去请求另一个接口，即data作为useEffect的第二个参数传入。
但是不知道为什么会造成死循环，拿不到我们想要的结果。
直到在官网看到这个例子：![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHp43GyFe3MZq9TgnGhE2libP4j7AfpUicz5PG6s9MBHduZR0kN9j7XDefo6wMUAAxgUTus1anA8Xgcg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

知道useEffect会比较前一次渲染和后一次渲染的值，然后我就在想，如果我所设置的data=[],那么即使我后一次渲染的data也为[],那么[]===[]为false,所以才会造成useEffect会一直不停的渲染，所以我把data的初始值改为undefined，试了一下果然可以。

**结论：useEffect的不作为componentDidUnmount的话，传入第二个参数时一定注意：第二个参数不能为引用类型，引用类型比较不出来数据的变化，会造成死循环**

### 3.2使用async await 时的报错

在代码中，我们使用async / await从第三方API获取数据。如果你对async/await熟悉的话，你会知道，每个async函数都会默认返回一个隐式的promise。但是，useEffect不应该返回任何内容。这就是为什么会在控制台日志中看到以下警告：

> Warning: useEffect function must return a cleanup function or nothing. Promises and useEffect(async () => …) are not supported, but you can call an async function inside an effect

这就是为什么不能直接在useEffect中使用async函数，因此，我们可以不直接调用async函数，而是像下面这样:

```
function App() {
  const [data, setData] = useState({ hits: [] });
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'http://localhost/api/v1/search?query=redux',
      );
 
      setData(result.data);
    };
 
    fetchData();
  }, []);
 
  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}
复制代码
```

## 4.useEffect在实战中的应用

### 4.1 响应更新

很多情况下，我们需要响应用户的输入，然后再请求。这个时候我们会引入一个input框，监听query值的变化：

```
import axios from 'axios';
 
function App() {
  const [data, setData] = useState({ hits: [] });
  const [query, setQuery] = useState('redux');
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'http://localhost/api/v1/search?query=redux',
      );
      setData(result.data);
    };
 
    fetchData();
  }, []);
 
  return (
    <Fragment>
      <input
        type="text"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <ul>
        {data.hits.map(item => (
          <li key={item.objectID}>
            <a href={item.url}>{item.title}</a>
          </li>
        ))}
      </ul>
    </Fragment>
  );
}
复制代码
```

有个query值，已经更新query的逻辑，还需要将这个query值传递给后台，这个操作会在useEffect中进行
前面我们说了，目前的useEffect只会在组件mount时执行，并且useEffect的第二个参数是依赖的变量，一旦这个依赖的变量变动，useEffect就会重新执行，所以我们需要添加query为useEffect的依赖：

```
function App() {
  const [data, setData] = useState({ hits: [] });
  const [query, setQuery] = useState('redux');
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        `http://localhost/api/v1/search?query=${query}`,
      );
 
      setData(result.data);
    };
 
    fetchData();
  }, [query]);
 
  return (
    ...
  );
}
复制代码
```

一旦更改了query值，就可以重新获取数据。但这会带来另一个问题：query的任何一次变动都会请求后端，这样会带来比较大的访问压力。这个时候我们需要引入一个按钮，点击这个按钮再发起请求。

```
function App() {
 const [data, setData] = useState({ hits: [] });
 const [query, setQuery] = useState('redux');
 const [search, setSearch] = useState('');

 useEffect(() => {
   const fetchData = async () => {
     const result = await axios(
       `http://localhost/api/v1/search?query=${query}`,
     );

     setData(result.data);
   };

   fetchData();
 }, [query]);

 return (
   <Fragment>
     <input
       type="text"
       value={query}
       onChange={event => setQuery(event.target.value)}
     />
     <button type="button" onClick={() => setSearch(query)}>
       Search
     </button>

     <ul>
       {data.hits.map(item => (
         <li key={item.objectID}>
           <a href={item.url}>{item.title}</a>
         </li>
       ))}
     </ul>
   </Fragment>
 );
}
复制代码
```

可以看到上面我们添加了一个新的按钮，然后创建新的组件state：search。每次点击按钮时，会把search的值设置为query，这个时候我们需要修改useEffect中的依赖项为search，这样每次点击按钮，search值变更，useEffect就会重新执行，避免不必要的变更：

```
function App() {
  const [data, setData] = useState({ hits: [] });
  const [query, setQuery] = useState('redux');
  const [search, setSearch] = useState('redux');
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        `http://localhost/api/v1/search?query=${search}`,
      );
 
      setData(result.data);
    };
 
    fetchData();
  }, [search]);
 
  return (
    ...
  );
}
 
export default App;
复制代码
```

此外，search state的初始状态设置为与query state 相同的状态，因为组件首先会在mount时获取数据。所以简单点，直接将的要请求的后端URL设置为search state的初始值。

```
function App() {
  const [data, setData] = useState({ hits: [] });
  const [query, setQuery] = useState('redux');
  const [url, setUrl] = useState(
    'http://localhost/api/v1/search?query=redux',
  );
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(url);
 
      setData(result.data);
    };
 
    fetchData();
  }, [url]);
 
  return (
    <Fragment>
      <input
        type="text"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <button
        type="button"
        onClick={() =>
          setUrl(`http://localhost/api/v1/search?query=${query}`)
        }
      >
        Search
      </button>
    <ul>
        {data.hits.map(item => (
          <li key={item.objectID}>
            <a href={item.url}>{item.title}</a>
          </li>
        ))}
      </ul>
    </Fragment>
  );
}
复制代码
```

### 4.2 如何处理Loading和Error

良好的用户体验是需要在请求后端数据，数据还没有返回时展现loading的状态，因此，我们还需要添加一个loading的state

```
import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
 
function App() {
  const [data, setData] = useState({ hits: [] });
  const [query, setQuery] = useState('redux');
  const [url, setUrl] = useState(
    'http://hn.algolia.com/api/v1/search?query=redux',
  );
  const [isLoading, setIsLoading] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
 
      const result = await axios(url);
 
      setData(result.data);
      setIsLoading(false);
    };
 
    fetchData();
  }, [url]);
  return (
    <Fragment>
      <input
        type="text"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <button
        type="button"
        onClick={() =>
          setUrl(`http://localhost/api/v1/search?query=${query}`)
        }
      >
        Search
      </button>
 
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {data.hits.map(item => (
            <li key={item.objectID}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
    </Fragment>
  );
}
复制代码
```

在useEffect中，请求数据前将loading置为true，在请求完成后，将loading置为false。我们可以看到useEffect的依赖数据中并没有添加loading，这是因为，我们不需要再loading变更时重新调用useEffect。请记住：只有某个变量更新后，需要重新执行useEffect的情况，才需要将该变量添加到useEffect的依赖数组中。

loading处理完成后，还需要处理错误，这里的逻辑是一样的，使用useState来创建一个新的state，然后在useEffect中特定的位置来更新这个state。由于我们使用了async/await，可以使用一个大大的try-catch:

```
import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
 
function App() {
  const [data, setData] = useState({ hits: [] });
  const [query, setQuery] = useState('redux');
  const [url, setUrl] = useState(
    'http://localhost/api/v1/search?query=redux',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
 
      try {
        const result = await axios(url);
 
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
 
      setIsLoading(false);
    };
 
    fetchData();
  }, [url]);
  return (......)

复制代码
```

每次useEffect执行时，将会重置error；在出现错误的时候，将error置为true；在正常请求完成后，将error置为false。

### 4.3 处理表单

通常，我们不仅会用到上面的输入框和按钮，更多的时候是一张表单，所以也可以在表单中使用useEffect来处理数据请求，逻辑是相同的：

```
function App() {
  ...
 
  return (
    <Fragment>
      <form
        onSubmit={() =>
          setUrl(`http://localhost/api/v1/search?query=${query}`)
        }
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
 
      {isError && <div>Something went wrong ...</div>}
 
      ...
    </Fragment>
  );
}
复制代码
```

上面的例子中，提交表单的时候，会触发页面刷新；就像通常的做法那样，还需要阻止默认事件，来阻止页面的刷新。

```
function App() {
  ...
 
  const doFetch = () => {
    setUrl(`http://localhost/api/v1/search?query=${query}`);
  };
 
  return (
    <Fragment>
      <form onSubmit={event => {
        doFetch();
 
        event.preventDefault();
      }}>
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
 
      {isError && <div>Something went wrong ...</div>}
 
      ...
    </Fragment>
  );
}
复制代码
```

### 4.4 自定义hooks

我们可以看到上面的组件，添加了一系列hooks和逻辑之后，已经变得非常的庞大。那这时候我们怎么处理呢？hooks的一个非常的优势，就是能够很方便的提取自定义的hooks。这个时候，我们就能把上面的一大堆逻辑抽取到一个单独的hooks中，方便复用和解耦。

```
function useHackerNewsApi = () => {
  const [data, setData] = useState({ hits: [] });
  const [url, setUrl] = useState(
    'http://localhost/api/v1/search?query=redux',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
 
      try {
        const result = await axios(url);
 
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
 
      setIsLoading(false);
    };
 
    fetchData();
  }, [url]);
 
  const doFetch = () => {
    setUrl(`http://localhost/api/v1/search?query=${query}`);
  };
 
  return { data, isLoading, isError, doFetch };
}
复制代码
```

在自定义的hooks抽离完成后，引入到组件中。

```
function App() {
  const [query, setQuery] = useState('redux');
  const { data, isLoading, isError, doFetch } = useHackerNewsApi();
 
  return (
    <Fragment>
      ...
    </Fragment>
  );
}
复制代码
```

然后我们需要在form组件中设定初始的后端URL

```
const useHackerNewsApi = () => {
  ...
 
  useEffect(
    ...
  );
 
  const doFetch = url => {
    setUrl(url);
  };
 
  return { data, isLoading, isError, doFetch };
};
 
function App() {
  const [query, setQuery] = useState('redux');
  const { data, isLoading, isError, doFetch } = useHackerNewsApi();
 
  return (
    <Fragment>
      <form
        onSubmit={event => {
          doFetch(
            `http://localhost/api/v1/search?query=${query}`,
          );
 
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
 
      ...
    </Fragment>
  );
}
复制代码
```

### 4.5使用useReducer整合逻辑

到目前为止，我们已经使用了各种state hooks来管理数据，包括loading、error、data等状态。但是我们可以看到，这三个有关联的状态确是分散的，它们通过分离的useState来创建，为了有关联的状态整合到一起，我们需要用到useReducer。

如果你写过redux，那么将会对useReducer非常的熟悉，可以把它理解为一个轻量额redux。useReducer 返回一个状态对象和一个可以改变状态对象的dispatch函数。跟redux类似的，dispatch函数接受action作为参数，action包含type和payload属性。我们看一个简单的例子吧：

```
import React, {
  Fragment,
  useState,
  useEffect,
  useReducer,
} from 'react';
import axios from 'axios';
 
const dataFetchReducer = (state, action) => {
  ...
};
 
const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl);
 
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
 
  ...
};
复制代码
```

useReducer将reducer函数和初始状态对象作为参数。在我们的例子中，data，loading和error状态的初始值与useState创建时一致，但它们已经整合到一个由useReducer创建对象，而不是多个useState创建的状态。

```
const dataFetchReducer = (state, action) => {
  ...
};
 
const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl);
 
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
 
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
 
      try {
        const result = await axios(url);
 
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAILURE' });
      }
    };
 
    fetchData();
  }, [url]);
 
  ...
};
复制代码
```

在获取数据时，可以调用dispatch函数，将信息发送给reducer。使用dispatch函数发送的参数为object，具有type属性和可选payload的属性。type属性告诉reducer需要应用哪个状态转换，并且reducer可以使用payload来创建新的状态。在这里，我们只有三个状态转换：发起请求，请求成功，请求失败。

在自定义hooks的末尾，state像以前一样返回，但是因为我们拿到的是一个状态对象，而不是以前那种分离的状态，所以需要将状态对象解构之后再返回。这样，调用useDataApi自定义hooks的人仍然可以访问data，isLoading 和 isError这三个状态。

```
const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl);
 
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
 
  ...
 
  const doFetch = url => {
    setUrl(url);
  };
 
  return { ...state, doFetch };
}; 
复制代码
```

接下来添加reducer函数的实现。它需要三种不同的状态转换FETCH_INIT，FETCH_SUCCESS和FETCH_FAILURE。每个状态转换都需要返回一个新的状态对象。让我们看看如何使用switch case语句实现它：

```
switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
复制代码
```

### 4.6取消数据请求

React中的一种很常见的问题是：如果在组件中发送一个请求，在请求还没有返回的时候卸载了组件，这个时候还会尝试设置这个状态，会报错。我们需要在hooks中处理这种情况，可以看下是怎样处理的：

```
const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl);
 
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
 
  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };
  fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
 
  const doFetch = url => {
    setUrl(url);
  };
 
  return { ...state, doFetch };
};
复制代码
```

我们可以看到这里新增了一个didCancel变量，如果这个变量为true，不会再发送dispatch，也不会再执行设置状态这个动作。这里我们在useEffe的返回函数中将didCancel置为true，在卸载组件时会自动调用这段逻辑。也就避免了再卸载的组件上设置状态。

## 5.useEffect 与 useLayoutEffect

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)1.png

- useEffect 在全部渲染完毕后才会执行
- useLayoutEffect 会在 浏览器 layout 之后，painting 之前执行
- 其函数签名与 useEffect 相同，但它会在所有的 DOM 变更之后同步调用 effect
- 可以使用它来读取 DOM 布局并同步触发重渲染
- 在浏览器执行绘制之前 useLayoutEffect 内部的更新计划将被同步刷新
- 尽可能使用标准的 useEffect 以避免阻塞视图更新

```
function LayoutEffect() {
   const [color, setColor] = useState('red');
   useLayoutEffect(() => {
       alert(color);
   });
   useEffect(() => {
       console.log('color', color);
   });
   return (
       <>
           <div id="myDiv" style={{ background: color }}>颜色</div>
           <button onClick={() => setColor('red')}>红</button>
           <button onClick={() => setColor('yellow')}>黄</button>
           <button onClick={() => setColor('blue')}>蓝</button>
       </>
   );
}
复制代码
```

**useEffect优势**
useEffect 在渲染结束时执行，所以不会阻塞浏览器渲染进程，所以使用 Function Component 写的项目一般都有用更好的性能。
自然符合 React Fiber 的理念，因为 Fiber 会根据情况暂停或插队执行不同组件的 Render，如果代码遵循了 Capture Value 的特性，在 Fiber 环境下会保证值的安全访问，同时弱化生命周期也能解决中断执行时带来的问题。
useEffect 不会在服务端渲染时执行。由于在 DOM 执行完毕后才执行，所以能保证拿到状态生效后的 DOM 属性。

## 6.useEffect源码解析

首先我们要牢记 effect hook 的一些属性：

- 它们在渲染时被创建，但是在浏览器绘制后运行。
- 如果给出了销毁指令，它们将在下一次绘制前被销毁。
- 它们会按照定义的顺序被运行。

于是就应该有另一个队列来保存这些 effect hook，并且还要能够在绘制后被定位到。通常来说，应该是 fiber 保存包含了 effect 节点的队列。每个 effect 节点都是一个不同的类型，并能在适当的状态下被定位到：

在修改之前调用 getSnapshotBeforeUpdate() 实例。

运行所有插入、更新、删除和 ref 的卸载。

运行所有生命周期函数和 ref 回调函数。生命周期函数会在一个独立的通道中运行，所以整个组件树中所有的替换、更新、删除都会被调用。这个过程还会触发任何特定于渲染器的初始 effect hook。

useEffect() hook 调度的 effect —— 也被称为“被动 effect”，它基于这部分代码。

hook effect 将会被保存在 fiber 一个称为 updateQueue 的属性上，每个 effect 节点都有如下的结构：

- tag —— 一个二进制数字，它控制了 effect 节点的行为
- create —— 绘制之后运行的回调函数
- destroy —— 它是 create() 返回的回调函数，将会在初始渲染前运行
- inputs —— 一个集合，该集合中的值将会决定一个 effect 节点是否应该被销毁或者重新创建
- next —— 它指向下一个定义在函数组件中的 effect 节点

除了 tag 属性，其他的属性都很简明易懂。如果你对 hook 很了解，你应该知道，React 提供了一些特殊的 effect hook：比如 useMutationEffect() 和 useLayoutEffect()。这两个 effect hook 内部都使用了 useEffect()，实际上这就意味着它们创建了 effect hook，但是却使用了不同的 tag 属性值。这个 tag 属性值是由二进制的值组合而成（详见源码）：

```
const NoEffect = /*             */ 0b00000000;
const UnmountSnapshot = /*      */ 0b00000010;
const UnmountMutation = /*      */ 0b00000100;
const MountMutation = /*        */ 0b00001000;
const UnmountLayout = /*        */ 0b00010000;
const MountLayout = /*          */ 0b00100000;
const MountPassive = /*         */ 0b01000000;
const UnmountPassive = /*       */ 0b10000000;
复制代码
```

复制代码React 支持的 hook effect 类型 这些二进制值中最常用的情景是使用管道符号（|）连接，将比特相加到单个某值上。然后我们就可以使用符号（&）检查某个 tag 属性是否能触发一个特定的行为。如果结果是非零的，就表示可以。

```
const effectTag = MountPassive | UnmountPassive
assert(effectTag, 0b11000000)
assert(effectTag & MountPassive, 0b10000000)
复制代码
```

复制代码如何使用 React 的二进制设计模式的示例 这里是 React 支持的 hook effect，以及它们的 tag 属性（详见源码）：

- Default effect —— UnmountPassive | MountPassive.
- Mutation effect —— UnmountSnapshot | MountMutation.
- Layout effect —— UnmountMutation | MountLayout.

以及这里是 React 如何检查行为触发的（详见源码）：

```
if ((effect.tag & unmountTag) !== NoHookEffect) {
  // Unmount
}
if ((effect.tag & mountTag) !== NoHookEffect) {
  // Mount
}
复制代码
```

源码节选 所以，基于我们刚才学习的关于 effect hook 的知识，我们可以实际操作，从外部向 fiber 插入一些 effect：

```
function injectEffect(fiber) {
  const lastEffect = fiber.updateQueue.lastEffect

  const destroyEffect = () => {
    console.log('on destroy')
  }

  const createEffect = () => {
    console.log('on create')

    return destroy
  }

  const injectedEffect = {
    tag: 0b11000000,
    next: lastEffect.next,
    create: createEffect,
    destroy: destroyEffect,
    inputs: [createEffect],
  }

  lastEffect.next = injectedEffect
}

const ParentComponent = (
  <ChildComponent ref={injectEffect} />
)
```

 