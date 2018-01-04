## 如何使用二维码

### 1.准备

手动集成拦截相关代码到需要测试的页面，具体步骤请参考[parrot-mocker项目][parrot-mocker]。

### 2.访问

同样先在Chrome中打开[首页][page-index]。

打开[QRCode页面][page-qrcode]，输入需要测试的页面链接。使用手机扫描实时生成的对应二维码，即可在正常访问待测试页面的同时，在[首页][page-index]上浏览到被转发的各个请求，以及进行类似的mock配置操作。

### 3.停止

实质上生成的二维码等于在待测试页面链接之中附加了几个特殊url参数，集成的[parrot-mocker代码][parrot-mocker]会识别它们从而开启请求拦截转发功能。并且与Chrome插件类似地，cookie中会保存相关信息，使得相同域的其它页面都将具有相同效果。

勾选[QRCode页面][page-qrcode]上的`reset`选项，再次扫描生成的二维码可以擦除相关cookie而恢复原状。

[parrot-mocker]: https://github.com/chinesedfan/parrot-mocker
[page-index]: https://parrotmocker.leanapp.cn
[page-qrcode]: https://parrotmocker.leanapp.cn/html/qrcode.html
