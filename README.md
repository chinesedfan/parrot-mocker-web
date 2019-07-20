# parrot-mocker-web [![npm version](https://badge.fury.io/js/parrot-mocker-web.svg)](https://badge.fury.io/js/parrot-mocker-web) [![Build Status](https://travis-ci.org/chinesedfan/parrot-mocker-web.svg?branch=master)](https://travis-ci.org/chinesedfan/parrot-mocker-web) [![Coverage Status](https://coveralls.io/repos/github/chinesedfan/parrot-mocker-web/badge.svg?branch=master)](https://coveralls.io/github/chinesedfan/parrot-mocker-web?branch=master) [![License](https://img.shields.io/github/license/chinesedfan/parrot-mocker-web.svg)][license]

[中文文档](https://github.com/chinesedfan/parrot-mocker-web/blob/master/README-zh.md)

This project provides a simple mock server, which works with the Chrome plugin [parrot-mocker](https://github.com/chinesedfan/parrot-mocker).

Support:
- foward requests of pages(xhr/jsonp/fetch) to the real web server, or just mock
- list all forwarded requests
- config mock rules for different requests

Not support:
- cookie sensitive requests, because the plugin forwards requests with cookies of the page, instead of cookies of the request domain
- relative or local DNS parsed requests, because the mock server can not resolve them
- ~~HTTPS pages, unless the mock server is deployed with HTTPS~~ (Solved by [leancloud][index-lean] and [now.sh][index-now])

## How to use

### 1.Prepare

Install Chrome plugin, [parrot-mocker](https://chrome.google.com/webstore/detail/parrotmocker/hdhamekapmnmceohfdbfelofidflfelm), so that your pages have the ablity to intercept requests and forward to this mock server. Other usages without the plugin can refer to [parrot-mocker project](https://github.com/chinesedfan/parrot-mocker).

<img src="pic/1.install.png" width="80%" />

### 2.Visit

For example, if deployed in [leancloud][index-lean], please open your Chrome browser and visit [index page][index-lean] first. Other instances like [now.sh][index-now] are similar.

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

By default, the server is launched on main port 8080, and sub-ports 8442/8443. Sub-ports can be visited by http/https correspondingly. Because my https is self-certified, if your browser gives a warning, please continue to visit.

```sh
node ./server/index.js
```

Or you can specify the port by an environment variable.

```sh
PORT=8888 HTTP_PORT=9442 HTTPS_PORT=9443 node ./server/index.js
```

To use local server, you should visit and set local address as mock server in step 2, i.e. `https://127.0.0.1:8080`, and other steps are similar with above.

## Tips

- In order to handles redirections well, please make sure the server can also visit itself by the host address that you input in the Chrome plugin.

## License

[MIT][license]

## Acknowledgement

* [jsoneditor](https://github.com/josdejong/jsoneditor), json editor


[index-lean]: https://parrotmocker.leanapp.cn
[index-now]: https://parrotmocker.now.sh
[license]: https://github.com/chinesedfan/parrot-mocker-web/blob/master/LICENSE
