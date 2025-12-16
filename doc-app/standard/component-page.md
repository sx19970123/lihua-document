# 页面与组件
> 因小程序平台有主包大小限制，项目创建时就完成了分包处理，建议只有公共页面和tabBar页面放在主包下

## 分包

- 主包为：`src/pages` 下的所有页面
- 分包为：`src/subpackages` 下的所有页面

对应的`pages.json`中主包 在 pages 下，分包在 subPackages 下，例：
```json
// 主包
"pages": [
  {
    "path": "pages/splash/index",
    "style": {
      "navigationStyle": "custom"
    }
  }
],
// 分包
"subPackages": [{
  "root": "subpackages/system",
  "pages": [{
    "path": "protocol/PrivacyPolicy",
    "style": {
      "navigationBarTitleText": "隐私政策"
    }
  }]
}],
```

> 微信小程序要求主包上限为2M，当前主包为1.44M。主包中包含大量静态资源占用空间，可根据实际需求决定是否删除。主包中一些公共组件不需要也可删除以减小空间占用。

::: warning 

主包静态资源主要用于自定义图标管理。为与 Web 端保持一致，App 端复用了 Web 端的图标资源。需要注意的是：当用户头像使用图标类型时可正常显示，但若相关图标资源被移除，用户头像将无法正确回显

:::

![fe92dd27-8a44-4fa1-bb9f-4f9a2a1c1f5e](./component-page.assets/fe92dd27-8a44-4fa1-bb9f-4f9a2a1c1f5e.png)



## 页面

页面根据实际需求在 `pages` 或 `subpackages` 下创建对应模块和 `vue`文件，与web端用法相同，支持vue3 和 uniapp 的生命周期钩子函数 [详见uniapp文档](https://uniapp.dcloud.net.cn/tutorial/page.html#vue3-lifecycle-flow)

## 组件

组件根据实际需求在 `src/components` 或 `subpackages/mode-name/components`下，模块单独使用的组件建议放在分包，全局共用组件可放在外层