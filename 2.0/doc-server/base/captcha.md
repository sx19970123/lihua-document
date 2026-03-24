# 验证码

项目集成了 [天爱验证码(TAC)](https://gitee.com/dromara/tianai-captcha) 免费版，支持四种验证方式，从后台统一配置

## 配置文件

`lihua-admin` 下 `application.yml` 配置文件可对验证码进行配置

``` yaml
 # 滑块验证码配置， 详细请看 cloud.tianai.captcha.autoconfiguration.ImageCaptchaProperties 类
captcha:
  # 如果项目中使用到了redis，滑块验证码会自动把验证码数据存到redis中， 这里配置redis的key的前缀
  prefix: REDIS_CACHE_CAPTCHA
  # 验证码过期时间，默认是2分钟,单位毫秒， 可以根据自身业务进行调整
  expire:
    # 缓存时间 1分钟
    default: 60000
    # 点选类型验证码缓存时间 2分钟
    WORD_IMAGE_CLICK: 120000
  # 使用自定义资源
  init-default-resource: true
  # 缓存控制
  local-cache-enabled: true
  # 验证码缓存数量
  local-cache-size: 20
  # 缓存拉取失败后等待时间
  local-cache-wait-time: 5000
  # 缓存检查间隔
  local-cache-period: 2000
  # 配置字体包，供文字点选验证码使用,可以配置多个
  font-path:
    - classpath:captcha-font/荆南波波黑-Bold.ttf # 免费可商用，来源：https://ziyouziti.com/mianfeiziti-444.html
    - classpath:captcha-font/也字工厂小石头.ttf # 免费可商用，来源：https://ziyouziti.com/mianfeiziti-457.html
  secondary:
    # 开启二次验证
    enabled: true
    # 二次验证过期时间 一分钟
    expire: 60000
    # 二次验证缓存key前缀
    keyPrefix: REDIS_CACHE_SECONDARY_CAPTCHA
```



## 静态资源

在 `lihua-captcha` 模块下 `resources` 中维护了验证码所需的静态资源。

### 背景图片

背景图片在项目 `src/main/resources/captcha-images` 目录下维护，要求图片资源大小为 `600*360` 格式为 `.jpg`



`InitCaptchaResource.java` 中定义了初始化验证码逻辑，在项目启动时会读取 `captcha-images` 中的图片进行初始化

### 字体

背景图片在项目 `src/main/resources/captcha-font` 目录下维护，可从 [自由字体](https://ziyouziti.com) 中进行下载使用，下载后在 `application.yml` 的 `captcha.font-path` 指定字体路径

