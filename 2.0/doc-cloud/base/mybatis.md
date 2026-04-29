# MyBatis-Plus

系统持久层框架使用MyBatis-Plus，此模块为对MP的配置，详细用法参考 [官方文档](https://baomidou.com/)。

## 基础类

### BaseEntity

带有 `createId` 、 `createTime` 、 `updateId` 、 `updateTime` 、 `delFlag` 的业务类可继承此类。继承后上述默认字段无需在业务中赋值，使用MyBatisPlus执行对应的新增、修改操作时会自动赋值。

### BaseDTO

封装了带有分页参数的类，一般业务分页DTO继承此类。



## 配置

### 配置文件

`lihua-admin` 下 `application.yml` 配置文件可对附件进行配置，当前项目xml文件在 `mapper` 层的 `xml` 目录下维护。

``` yaml
mybatis-plus:
  global-config:
    db-config:
      # 逻辑删除对应字段
      logic-delete-field: delFlag
      # 逻辑删除后的字段对应值
      logic-delete-value: 1
      # 逻辑删除前的字段对应值
      logic-not-delete-value: 0
  # 将 xml 放到 java 目录下
  mapper-locations: classpath*:com/lihua/**/mapper/**/*.xml
```



### 配置类

`MybatisPlusConfig` 下进行分页插件的配置。

``` java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 如果配置多个插件,切记分页最后添加
        PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor();
        // 分页溢出后自动查询第一页
        paginationInnerInterceptor.setOverflow(true);
        // 数据库类型
        paginationInnerInterceptor.setDbType(DbType.MYSQL);
        interceptor.addInnerInterceptor(paginationInnerInterceptor);
        return interceptor;
    }
}
```



## 自动填充

仅在 `BaseEntity` 中设置了自动填充注解，会根据 插入 / 更新 方法进行对 `BaseEntity` 基础数据的填充。

``` java
@Component
public class AutoFillHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        // 创建用户
        if (LoginUserContext.getUserId() != null) {
            this.strictInsertFill(metaObject, "createId", String.class, LoginUserContext.getUserId());
        }
        // 创建时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, DateUtils.now());
        // 逻辑删除
        this.strictInsertFill(metaObject, "delFlag", String.class, "0");
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        // 更新用户
        if (LoginUserContext.getUserId() != null) {
            this.strictUpdateFill(metaObject, "updateId", String.class, LoginUserContext.getUserId());
        }
        // 更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, DateUtils.now());
    }
}
```

