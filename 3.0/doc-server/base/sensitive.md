# 数据脱敏

本模块通过自定义注解和切面实现了简单的数据脱敏功能。



::: warning 提示

数据脱敏中集合类型字段不可设置为**不可变集合**，否则将抛出异常

:::

## @Sensitive 

标记在实体类需要脱敏的字段上，指定脱敏规则即可。可作用于String、List\<String\>、Set\<String\>、Map\<?, String\> 等字段

- type：脱敏规则，由 `DesensitizedTypeEnum` 维护，可自行扩展
- ignoreRoleCodes：忽略角色编码，拥有对应角色的用户不进行数据脱敏（默认 `ROLE_admin`，即管理员可见明文；传入空数组 `ignoreRoleCodes = {}` 表示对所有人脱敏）

``` java
    /**
     * 手机号码
     */
    @Sensitive(type = DesensitizedTypeEnum.PHONE_NUMBER, ignoreRoleCodes = {})
    @ExcelProperty({"用户信息", "手机号码"})
    private String phoneNumber;
```

脱敏规则由 `DesensitizedTypeEnum` 枚举维护，内置以下类型：

| 枚举值 | 脱敏效果 |
| ------ | -------- |
| `PHONE_NUMBER` | 手机号码，中间四位替换 |
| `EMAIL` | 电子邮箱，显示前两个字符和@后字符 |
| `IP` | IP地址，隐藏中间一段 |
| `ID_CARD` | 身份证号，显示前后四位 |
| `BANK_CARD` | 银行卡号，仅显示最后四位 |

## @DeepSensitive 

标记在实体类中需要脱敏的字段上，该字段为一对一的对象，标记`@DeepSensitive` 后会解析此对象中标记 `@Sensitive` 注解的属性

``` java
    /**
     * 标记到对象中，支持List<SysUserVO>、Set<SysUserVO>、Map<String, SysUserVO> 等
     */    
    @DeepSensitive
    private SysUserVO vos;
```

## @ApplySensitive 

 应用数据脱敏。只标记 `@Sensitive` 和 `@DeepSensitive` 并不会处理数据脱敏，需要在对应的方法上使用`@ApplySensitive` 后才会对返回值进行拦截处理

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
