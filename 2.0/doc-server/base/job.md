# 定时任务

定时任务基于 `Snail Job` 开发，详细用法参考：[官方文档](https://snailjob.opensnail.com/)。



## 启用定时任务

在 `lihua-admin` 的启动类 `LiHuaApplication` 中，标记 `@EnableSnailJob` 注解即可启动

``` java
@EnableSnailJob
@SpringBootApplication
public class LiHuaApplication {
    public static void main(String[] args) {
        SpringApplication.run(LiHuaApplication.class, args);
    }
}
```



## 配置

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对定时任务进行配置

``` yaml
# 定时任务
snail-job:
  server:
    host: 127.0.0.1
    port: 17888
  namespace: ''
  group: ''
  token: ''
```
