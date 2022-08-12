# React中的TS类型过滤

TS类型过滤

```
type FilterConditionally<Source, Condition> = Pick<
  Source, 
  {
    [K in keyof Source]: Source[K] extends Condition ? K : never
  }[keyof Source]
>;
```

别看很复杂，其实非常有用，它可以从一个对象类型中过滤出你想要的，比如：

```
interface Example {
    a: string; // ✅ 
    b: string; // ✅  
    c: number; // ❌ 
    d: boolean; // ❌ 
}
type NewType = FilterConditionally<Sample, string>
/*
 NewType 最终结果为：
 {
  a: string;
  b: string
 }
*/
```

相信大家已经这个类型的作用了，并且你们也很想读懂它，没关系，接下来由内而外、一步一步地介绍，一定让你们完全读懂，读不懂评论区来喷我（我说着玩的~）

## 分步介绍

涉及的知识点比较多，怕有些不熟悉TS的同学懵逼，先来介绍其中几个常见的基础知识点

### 开胃小菜

不会耽误大家多少时间的，会的小伙伴可以直接调过

#### keyof

关键词 `keyof` 的名字叫 索引类型查询操作符，它的作用就像它的字面意思一样直白：xx的key值

```
interface Example {
 a: string;
  b: string;
  c: number;
  d: boolean;
}

type Keys = keyof Example   // 等价于 type Keys = 'a' | 'b' | 'c' | 'd'
```

你可以把 `keyof` 简单理解为 JavaScript 中的 `Object.keys`

#### in

关键词 `in` 可以遍历枚举类型，比如：

```
type Keys = 'a' | 'b' | 'c' | 'd'

type Obj = {
  [T in Keys]: string;  // 遍历Keys，把每个key都赋值string类型
}
/* 等价于 
  type Obj = {
    a: string;
    b: string;
   c: string;
   d: string;
  }
*/
```

你可以把 `in` 简单理解为 JavaScript 中 `for...in` 的 `in` 的作用

#### Conditional

第二个知识点是条件判断，比如：

```
interface A {}

interface B extends A {}  // B继承于A

// B是否继承于A？若是，则为number类型；若不是，则为string类型
type C = B extends A ? number : string  // 等价于 type C = number

// A是否继承于B？若是，则为number类型；若不是，则为string类型
type D = A extends B ? number : string  // 等价于 type D = string
```

你可以把 `A extends B ? number : string` 简单理解为 JavaScript 中的三元运算符

#### 泛型

泛型我就不多做介绍了，不太了解的小伙伴可以直接看 **TS文档——泛型**[1]

### 正餐开始

刚刚介绍完"开胃小菜"，那就趁热打铁看一个简单的类型

```
type MarkUnwantedTypesAsNever<Source, Condition> ={
  [K in keyof Source]: Source[K] extends Condition ? K : never
}
```

一句话介绍这个类型的作用就是：遍历一个对象类型，将不想要的类型标记为 `never`

举个例子🌰

```
interface Example {
    a: string; // ✅ 
    b: string; // ✅  
    c: number; // ❌ 
    d: boolean; // ❌ 
}

// 我只想要Example类型中的string类型的key，非string的就标记为never
type MyType = MarkUnwantedTypesAsNever<Example, string>
/*
 等价于：
 type MyType = {
  a: 'a';
  b: 'b';
  c: never;
  d: never;
 }
*/
```

稍微讲一下小细节，`[K in keyof Example]` 遍历了 `Example` 这个对象类型，然后用条件判断 `Example[K] extends string ? K : never` 给对应的 key 值赋值，假设遍历第一个key值为 `a`，那么 `Example[K] = Example[a] = string`，此时就是 `string extends string ? 'a' : never`，`string` 肯定是继承于 `string` 的，所以才会有这样一个结果

此时大家心头一惊，为什么要把类型搞成这样？？我们最后想要的结果不是要拿到一个 `{ a:string; b:string }` 的类型吗？别急，后面还有别的操作

再来看一个索引访问接口属性的小知识点

```
type Value = {name: "zero2one"}["name"]  // 等价于 type Value = "zero2one"
```

你可以把它简单理解成 JavaScript 中访问对象某个key对应的value

而在TS中还有另一种情况：

```
type Value = {
  name: "zero2one"; 
  age: 23
}["name" | "age"]

// 等价于 type Value = "zero2one" | 23
```

而值为 `never` 的 `key` 值是无法被访问到的：

```
type Value = {
  name: "zero2one"; 
  age: never
}["name" | "age"]

// 等价于 type Value = "zero2one"
```

所以接下来可以看更复杂的类型了

```
type MarkUnwantedTypesAsNever<Source, Condition> ={
  [K in keyof Source]: Source[K] extends Condition ? K : never
}[keyof Source]
```

我们巧妙地利用 `keyof` 关键词去遍历访问所有的接口属性

```
// 借用一下刚才例子的结果
type MyType = {
   a: 'a';
  b: 'b';
  c: never;
  d: never;
}['a' | 'b' | 'c' | 'd']

/*
 等价于：
 type MyType = 'a' | 'b'
*/
```

到此为止，我们所做的事情就是：把目标对象类型中想要类型的 key 值筛选了出来

别急别急，离成功就差一步之遥

最后登场的就是 `Pick` ，这个类型是TS内置的，简单了解一下它的作用

```
// Pick类型的实现
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
}
```

你可以不去详细地读懂它的实现，只需要知道 `Pick` 的作用就是：筛选出类型`T` 中指定的某些属性

举个简单的例子：

```
interface A {
  a: 1;
  b: 2;
  c: 3;
  d: 4;
}

type C = Pick<A, 'a' | 'c'>  // 等价于 type C = { a: 1; c: 3 }
```

是的，就是这么简单，好了可以来看最终的BOSS了

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

那么最后再从 `Source` 中筛选出对应属性即可，回到本文具体的例子当中，图中红框中的值上文已得到为 `type MyType = 'a' | 'b'`，那最后 Pick 一下就好了

```
interface Example {
 a: string;
  b: string;
  c: number;
  d: boolean;
}

// 上文得到的结果
type MyType = 'a' | 'b'

type Result = Pick<Example, MyType>  // 等价于 type Result = { a: string; b: string }

// ---- 以上等价于 ---- //

interface Example {
    a: string; // ✅ 
    b: string; // ✅  
    c: number; // ❌ 
    d: boolean; // ❌ 
}
type NewType = FilterConditionally<Sample, string>
/*
 NewType 最终结果为：
 {
  a: string;
  b: string
 }
*/
```

这就是文章开头的结果获取的全过程

## 实战应用例子

正如本文标题所说的，TS类型过滤在很多优秀的开源库中是非常常见的，比如我们熟悉的React中就是：

```
type ElementType<P = any> = {
 [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never
}[keyof JSX.IntrinsicElements] | ComponentType<P>;
```