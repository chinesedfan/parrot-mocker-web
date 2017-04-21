# parrot-mocker-web

[中文文档](https://github.com/chinesedfan/parrot-mocker-web/blob/master/README-zh.md)

This project provides a simple mock server, which works with the Chrome plugin [parrot-mocker](https://github.com/chinesedfan/parrot-mocker).

Support:
- foward requests of pages(xhr/jsonp/fetch) to the real web server, or just mock
- list all forwarded requests
- config mock rules for different requests

Not support:
- cookie sensitive requests, because the plugin forwards requests with cookies of the page, instead of cookies of the request domain
- relative or local DNS parsed requests, because the mock server can not resolve them
- ~~HTTPS pages, unless the mock server is deployed with HTTPS~~ (Solved by [leancloud](https://parrotmocker.leanapp.cn))

## How to use

### 1.Prepare

Install [parrot-mocker](https://github.com/chinesedfan/parrot-mocker/releases), so that your pages have the ablity to intercept requests and forward to this mock server.

<img src="pic/1.install.png" width="80%" />

### 2.Visit

Please open your Chrome browser and visit [index page](https://parrotmocker.leanapp.cn) first.

<img src="pic/2.1.index.png" width="80%" />

Then visit your test page, i.e. [my demo](https://chinesedfan.github.io/parrot-mocker/demo.html), which will send 3 different requests(xhr/jsonp/fetch) after loaded.

<img src="pic/2.2.demo.png" width="80%" />

In the plugin, input the mock server address and click the green button. The test page will reload automatically.

<img src="pic/2.3.prepare.png" width="80%" />

Now you will find that requests are forwarded to the mock server, which are also visiable at [index page](https://parrotmocker.leanapp.cn). If visiting other pages in the same domain, their requests will also be forwarded to this mock server.

<img src="pic/2.4.retransmit.png" width="80%" />
<img src="pic/2.5.list.png" width="80%" />

### 3.Mock

Click any request in the list, and click 'Add'. Then this request is added to mock.

Open [config page](https://parrotmocker.leanapp.cn/html/config.html), now you can edit the mock data. Remember to click 'Apply' to really use the mock data.

<img src="pic/3.1.mock.png" width="80%" />

Refresh your test page to check whether the mock is working correctly.

<img src="pic/3.2.result.png" width="80%" />
<img src="pic/3.3.list.png" width="80%" />

## Launch locally

By default, the server is launched on port 8080.

```sh
node ./server/index.js
```

Or you can specify the port by an environment variable.

```sh
PORT=8888 node ./server/index.js
```

Local index page is `http://127.0.0.1:8080`. You should use this address as mock server in step 2, and other steps are similar with above.

## License

MIT

## Acknowledgement

* [jsoneditor](https://github.com/josdejong/jsoneditor), json editor
