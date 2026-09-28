# 定时任务

定时任务基于 `Snail Job`（2.0.2）开发，详细用法参考：[官方文档](https://snailjob.opensnail.com/)。



## 启用定时任务

在 `lihua-admin` 的启动类 `LiHuaApplication` 中，放开 `@EnableSnailJob` 注解的注释即可启动

``` java
// @EnableSnailJob
@SpringBootApplication
@EnableAsync(proxyTargetClass = true)
@MapperScan({"com.lihua.**.mapper"})
@ComponentScan({"com.lihua.**"})
public class LiHuaApplication {
    public static void main(String[] args) {
        SpringApplication.run(LiHuaApplication.class, args);
    }
}
```

> 默认未接入 Snail Job 服务端的部署无需关心此模块；`@EnableSnailJob` 处于注释状态时不影响系统启动



## 配置

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对定时任务进行配置（默认同样处于注释状态）

``` yaml
# 定时任务
# 如需启用需要从启动类【com/lihua/LiHuaApplication.java】中将 @EnableSnailJob 注释解除
# snail-job:
#   server:
#     host: 127.0.0.1
#     port: 17888
#   namespace: ''
#   group: ''
#   token: ''
```
