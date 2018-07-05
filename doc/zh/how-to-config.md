## 格式

整个配置是一个`严格JSON格式`的数组，必要时请先通过`JSON.stringify()`进行转义。被转发的请求会尝试依次匹配，直到找到某个请求路径和匹配方式(以及参数)都相符的规则。如果没有命中任何规则，则由mock服务器转发到真正的API服务器。其中每一项配置规则支持的字段为：
- ~~headers，Array~~
- ~~protocol，String~~
- host，String，包含端口信息，如果设置了则status/response无效
- path，String，必填，请求路径
- prepath，String，请求路径前缀，一般配合host达到替换请求前缀的目的
- pathtype，String，请求路径匹配方式
    - "equal"，字符串相等，缺省值
    - "regexp"，正则表达式，一般配合host达到切换域名的目的
- params，String，请求参数，使得相同接口能够根据不同参数而返回不同结果
    - 支持对GET/POST参数过滤，格式统一为GET形式，如：`a=1&b=2`
    - 参数顺序不敏感，注意对参数值进行编码
- callback, String, JSONP回调参数名
    - "callback"，缺省值，模拟响应JSONP接口如：`callback=jsonp_xxxx`
- status，Number，必填，返回码，通过ctx.status设置
- delay，Number，额外延时，单位ms
- response，String/Number/Object，必填，返回内容，通过ctx.body设置
- responsetype，String，返回内容的生成方式
    - "raw"，写什么返回什么，缺省值
    - "mockjs"，使用Mock.js模板，参考：[示例文档](http://mockjs.com/examples.html)，注意文档中使用的是Javascript对象写法

### 示例1，直接修改response.msg

```
[
    {
        "path": "/api/testjsonp",
        "status": 200,
        "response": {
            "code": 200,
            "msg": "mock jsonp"
        }
    }
]
```

### 示例2，通过host/path/pathtype/prepath切换部分接口域名

```
[
    {
        "host": "127.0.0.1:8080",
        "path": "/api/test[xj]",
        "prepath": "/mock/123",
        "pathtype": "regexp"
    }
]
```
### 示例3，通过responsetype/response随机生成数据

```
[
    {
        "path": "/api/testjsonp",
        "status": 200,
        "responsetype": "mockjs",
        "response": {
            "code": 200,
            "msg|+1": [
                "Hello",
                "Mock.js",
                "!"
            ]
        }
    }
]
```

### 示例4，通过params定制多种返回结果

```
[
    {
        "path": "/api/testjsonp",
        "params": "a=1&b=2",
        "status": 200,
        "response": {
            "code": 200,
            "msg": "mock jsonp"
        }
    }
]
```
