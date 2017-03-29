# parrot-mocker-web

Simple web server to forward received requests to real servers or just mock.

## How to use

### 1.Prepare

With [parrot-mocker](https://github.com/chinesedfan/parrot-mocker), make your page have the ablity to intercept requests and forward to this mock server.

### 2.Launch

By default, the server is launched on port 8080.

```sh
node ./server/index.js
```

Or you can specify the port by an environment variable.

```sh
PORT=8888 node ./server/index.js
```

### 3.Visit

Visit http://127.0.0.1:8080 and click `QRCode` to the generating page. Input your prepared url, then click or scan the QR code.

Now you will find the plugin is enabled and corresponding requests are listed in http://127.0.0.1:8080.

If visiting other pages in the same domain, their requests will also be forwarded to this mock server.

### 4.Mock

Click any request in the list, and click 'Add'. Then this request is added to mock.

Open the `Config` page, now you can edit the mock data. Remember to click 'Apply' to really use the mock data.

Refresh your test page to check whether the mock is working correctly.

## Attention

* NOT support cookie sensitive requests.

Because only page's cookies are send to the mock server. If the request shares the same domain with the page, some path sensitive cookies is lost. If the request is in another domain, all cookies are lost. But you can copy required cookies to the page domain/path in advance.

* NOT support relative or local requests.

Because the mock server is nearly impossiable to resolve hosts of these requests. The client may modify local hosts file to fake DNS parsing.

* NOT support HTTPS pages.

Unless launch this mock server with an HTTPS certificate, you'd better to only play with HTTP pages.

## Acknowledgement

* [jsoneditor](https://github.com/josdejong/jsoneditor), json editor
