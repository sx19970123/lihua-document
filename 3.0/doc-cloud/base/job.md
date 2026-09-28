# 定时任务

定时任务基于 `Snail Job` 开发，详细用法参考：[官方文档](https://snailjob.opensnail.com/)。微服务版下定时任务由需要执行任务的业务服务（如 `lihua-system`）接入。



## 启用定时任务

默认关闭，在需要的服务启动类（如 `LiHuaSystemApplication`）中标记 `@EnableSnailJob` 注解即可启动

``` java
@EnableSnailJob
@EnableAsync(proxyTargetClass = true)
@EnableAspectJAutoProxy(exposeProxy = true)
@SpringBootApplication
@MapperScan({"com.lihua.**.mapper"})
@ComponentScan({"com.lihua.**"})
public class LiHuaSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(LiHuaSystemApplication.class, args);
    }
}
```



## 配置

在 Nacos 对应服务的 yaml（如 `lihua-system.yaml`）中对定时任务进行配置（默认已提供注释模板，解除注释后按实际情况填写）：

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
