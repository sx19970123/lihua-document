# 系统日志

此模块下定义了系统日志注解`@Log` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会记录操作日志。

## @Log

- description：模块描述（必填）
- type：模块类型（必填，由`LogTypeEnum` 维护）
- excludeParams：排除参数（默认为[]），指定后对应字段不进入日志与Redis数据面，适合密码等敏感参数
- recordResult：记录返回结果（默认true）

```java
@Log(description = "用户登录", type = LogTypeEnum.LOGIN, excludeParams = {"password"}, recordResult = false)
public String login(@RequestBody @Valid CurrentUser currentUser) {
    return success();
}
```

> 登录、注册等认证类接口 `recordResult` 固定为 `false` 不记录返回结果，避免token等敏感信息落入日志；`excludeParams` 与 `@PreventDuplicateSubmit` 注解的该属性同源口径
