# 项目启动

## 前期准备

- 开发环境：[node 20+](https://nodejs.cn/download/)
-  开发工具：[HbuilderX](https://www.dcloud.io/hbuilderx.html)
- 小程序开发工具：[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html) 

## 拉取项目代码

1. 前往仓库下载master分支代码 [仓库](https://gitee.com/yukino_git/lihua-app)

   ![image-20251216132805953](/Users/yukino/MyCode/lihua-document/doc-app/basic/start.assets/image-20251216132805953.png)

   ![image-20251216132901082](./start.assets/image-20251216132901082.png)

2. 使用 `HbuilderX` 导入项目刚才下载解压好的项目源码

   ![image-20251216133037773](./start.assets/image-20251216133037773.png)

3. 导入后在终端执行`npm install`命令安装依赖

   ![image-20251216133432430](/Users/yukino/MyCode/lihua-document/doc-app/basic/start.assets/image-20251216133432430.png)

   ![image-20251216133757008](./start.assets/image-20251216133757008.png)

## 基础配置

> 请确保狸花猫后台(1.3.0+)已正常启动，填写正确的ip及端口 [后台启动教程](../../doc-server/server)

1. 找到项目下`.env`  环境变量配置，根据自己后台情况配置 `VITE_APP_BASE_API` 和 `VITE_APP_WS_API`

   ![image-20251216134105045](./start.assets/image-20251216134105045.png)

2. 在项目目录`src/manifest.json`中 `基础配置` 获取Uniapp的AppId

   ![image-20251216143715163](./start.assets/image-20251216143715163.png)

   



## 运行

> 本项目支持运行到安卓、Ios app及微信小程序，其余平台请自行测试

### 运行到App

> 运行到iOS基座需要 Apple 颁发的证书及签名，[详见](https://uniapp.dcloud.net.cn/tutorial/run/ios-apple-certificate-signature.html)

HbuilderX `运行` ` 运行到手机或模拟器` ` 运行到安卓或iOS App基座`

![image-20251216135016057](./start.assets/image-20251216135016057.png)

手机使用数据线连接电脑（安卓需要打开开发者模式，开启usb调试）找到自己的手机，选择基座类型后点击运行

![image-20251216135555103](./start.assets/image-20251216135555103.png)

编译完成后控制台会打印项目已启动，手机上会出现对应app

![image-20251216135927240](./start.assets/image-20251216135927240.png)

![image-20251216140059722](./start.assets/image-20251216140059722.png)

打开App显示此页面即启动成功

::: info 如显示 连接服务器失败，点击重试 则表示**后台服务未启动**或**.env**配置有误

<div style="display:flex; flex-wrap:wrap; gap:8px;">
    <img src="./start.assets/IMG_1934.png" width="45%" />
    <img src="./start.assets/IMG_1935.png" width="45%" />
</div>

:::

### 运行到微信小程序

> 运行到微信小程序需提前[注册](https://mp.weixin.qq.com/cgi-bin/wx)，并确保电脑上安装了[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)

HbuilderX `运行` ` 运行到手机或模拟器` ` 微信开发者工具`

![image-20251216142738830](./start.assets/image-20251216142738830.png)

运行成功会自动调起微信开发者工具，第一次启动需要从 `设置` `通用设置` `安全` 中将 `服务端口` 打开

![image-20251216143004955](./start.assets/image-20251216143004955.png)

运行成功后会提示 `fail appid missing` 将自己账号下的appid进行配置

![image-20251216143353039](./start.assets/image-20251216143353039.png)

从项目 `src/manifest.json` 中 ` 微信小程序配置` 也可进行配置

![image-20251216143827805](./start.assets/image-20251216143827805.png)





















