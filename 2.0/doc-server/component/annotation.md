# 注解

> 仅列出了自定义注解和SpringSecurity的权限校验注解
>
> 其他注解请参考对应第三方库的官方文档

## 日志记录

`@Log` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会记录操作日志

参数

- description：模块描述（必填）
- type：模块类型（必填）
- excludeParams：排除参数（默认为[]）
- recordResult：记录返回结果（默认true）

``` java
@Log(description = "用户登录", type = LogTypeEnum.LOGIN, excludeParams = {"password", "requestKey"}, recordResult = false)
public String login(@RequestBody @Valid CurrentUser currentUser) {
    return success();
}
```

## 限流

`@RateLimiter` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会进行限流处理

参数

- value：同一请求每秒超过 value 次之后的请求全部拒绝（默认 5）

``` java
@PostMapping("reloadData")
@RateLimiter
public String reloadData() {
    sysAuthenticationService.cacheLoginUserInfo(LoginUserContext.getLoginUser());
    return success();
}

// 该接口每秒只能处理10次，超出的请求全部丢弃
@PostMapping("login")
@RateLimiter(10)
public String login(@RequestBody @Valid CurrentUser currentUser) {
    return success();
}
```

## 防重复提交

`@PreventDuplicateSubmit` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会检测同一用户再规定时间内是否请求多次，多余请求会拒绝处理

参数

- value：同一用户在 value 时间内只能请求一次（默认 1000 毫秒）
- timeUnit：value 时间单位（默认 TimeUnit.MILLISECONDS）

``` java
// 同一用户1秒内只能访问该接口一次
@PostMapping
@PreventDuplicateSubmit
public String save(@RequestBody @Validated SysDept sysDept) {
    return success(sysDeptService.saveDept(sysDept));
}

// 同一用户1天内只能访问该接口一次
@PostMapping
@PreventDuplicateSubmit(value = 1, timeUnit = TimeUnit.DAYS)
public String save(@RequestBody @Validated SysDept sysDept) {
    return success(sysDeptService.saveDept(sysDept));
}
```

##  权限验证

> SpringSecurity注解，详情请参考[官方文档](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)

`@PreAuthorize("hasRole()")` 在需要记录的 `controller` 接口上打上该注解，有用对应角色的用户才会接受请求

``` java
@PreAuthorize("hasRole('ROLE_admin')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

`@PreAuthorize("hasAnyRole()")` 在需要记录的 `controller` 接口上打上该注解，有用对应任意角色的用户才会接受请求

``` java
@PreAuthorize("hasAnyRole('ROLE_admin','ROLE_common')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

`@PreAuthorize("hasAuthority()")` 在需要记录的 `controller` 接口上打上该注解，有用对应权限的用户才会接受请求

``` java
@PreAuthorize("hasAuthority('system:dept:save')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

`@PreAuthorize("hasAnyAuthority()")` 在需要记录的 `controller` 接口上打上该注解，有用对应任意权限的用户才会接受请求

``` java
@PreAuthorize("hasAnyAuthority('system:dept:save','system:dept:all')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

## 数据脱敏

::: warning 提示

数据脱敏中集合类型字段不可设置为**不可变集合**，否则将抛出异常

:::

`@Sensitive` 标记在实体类需要脱敏的字段上，指定脱敏规则即可。可作用于String、List\<String\>、Set\<String\>、Map\<?, String\> 等字段

- type：脱敏规则，由 `DesensitizedTypeEnum` 维护，可自行扩展
- ignoreRoleCodes：忽略角色编码，拥有对应角色的用户不进行数据脱敏

``` java
    /**
     * 手机号码
     */
    @Sensitive(type = DesensitizedTypeEnum.PHONE_NUMBER, ignoreRoleCodes = {})
    @ExcelColumn(order = 4, index = 4, title = "用户信息->手机号码", width = 8)
    private String phoneNumber;
```

`@DeepSensitive` 标记在实体类中需要脱敏的字段上，该字段为一对一的对象，标记`@DeepSensitive` 后会解析此对象中标记 `@Sensitive` 注解的属性

``` java
    /**
     * 标记到对象中，支持List<SysUserVO>、Set<SysUserVO>、Map<String, SysUserVO> 等
     */    
	@DeepSensitive
    private SysUserVO vos;
```

`@ApplySensitive` 应用数据脱敏。只标记 `@Sensitive` 和 `@DeepSensitive` 并不会处理数据脱敏，需要在对应的方法上使用`@ApplySensitive` 后才会对返回值进行拦截处理

``` java
	/**
     * 方法上标记了@ApplySensitive，会对该方法的返回值进行拦截，解析SysUserVO中的 @Sensitive 和 @DeepSensitive 注解
     * 支持 IPage、Collection、Map、数组、对象 五种数据格式
     */ 
	@ApplySensitive
    @Override
    public IPage<SysUserVO> queryPage(SysUserDTO sysUserDTO) {
        IPage<SysUserVO> iPage = new Page<>(sysUserDTO.getPageNum(), sysUserDTO.getPageSize());
		// 中间代码省略 ...
        return iPage;
    }
```

