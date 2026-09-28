# 系统日志

此模块下定义了系统日志注解`@Log` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会记录操作日志。

微服务版下日志落库位于 `lihua-system`：本模块通过 `LogClient` 接口消费日志，system 服务走本地直写（`LogClientLocalImpl`，`@Primary` 优先），其他 servlet 服务经 `SysLogClientFacade` 以异步 RPC fire-and-forget 写入——失败由消费端 subscribe 的 onError 回调留痕，不阻塞业务链路。

## @Log

- description：模块描述（必填）
- type：模块类型（必填，由`LogTypeEnum` 维护）
- excludeParams：排除参数（默认为[]）
- recordResult：记录返回结果（默认true）

```java
@Log(description = "用户登录", type = LogTypeEnum.LOGIN, excludeParams = {"password", "requestKey"}, recordResult = false)
public String login(@RequestBody @Valid SysLoginUserDTO loginUserDTO) {
    return success();
}
```
