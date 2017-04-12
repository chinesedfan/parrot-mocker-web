# parrot-mocker-web

项目提供一个简单的mock服务器，配置Chrome插件[parrot-mocker](https://github.com/chinesedfan/parrot-mocker)，支持：
- 转发请求(xhr/jsonp/fetch)到真正的服务器，或者只返回mock数据
- 浏览请求和配置mock数据的界面

不支持：
- cookie敏感的请求，因为插件转发的请求只携带了'页面所在域'的cookie，而不是'请求本身的域'的cookie
- 相对请求或本地请求，因为此类请求到达mock服务器后，无法解析到真正的host
- https页面，除非把本项目部署成https

## 如何使用

### 1.准备

安装Chrome插件，[parrot-mocker](https://github.com/chinesedfan/parrot-mocker) ，使得页面上的请求可以被拦截转发到mock服务器。

### 2.启动

默认启动在端口8080。

```sh
node ./server/index.js
```

或者也可以通过环境变量来更换端口。

```sh
PORT=8888 node ./server/index.js
```

### 3.访问

在Chrome中打开，http://127.0.0.1:8080，点击'QRCode'按钮到测试链接生成页面。输入你要进行数据mock的页面链接，点击二维码。

在打开的测试页面中，你会发现url上被附加了几个特殊参数，同时插件已经启用了。

此时的网络请求都被转发到了mock服务器，在http://127.0.0.1:8080上可以浏览到。如果去掉url上的附加参数，甚至访问相同域的其它页面，都具有该功能。因为插件在cookie中已经记录了mock相关信息。

### 4.Mock

选中请求列表中的任意请求，然后点击'Add'按钮，该请求就被添加到mock配置中。

打开'Config'页面可以编辑mock数据，记得'Apply'才能让mock数据真正生效。

刷新原来的测试链接，会发现数据已经被mock。

### 5.停止

在插件上的反选'mock enabled'。

## 致谢

* [jsoneditor](https://github.com/josdejong/jsoneditor), json编辑器
