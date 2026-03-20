# Service 开发

系统集成了Mybatis-Plus，在ServiceImpl实现类中继承`ServiceImpl<EntityMapper, Entity>` 提高开发效率 [官方文档](https://baomidou.com/guides/data-interface/)

## 接口

``` java
public interface TestService {
    /**
     * 分页查询
     */
    IPage<Test> findPage(TestDTO dto);
}
```

## 实现类

实现类继承 `ServiceImpl` 泛型为对应`Mapper` 和 `实体类`

``` java
@Service
public class TestServiceImpl extends ServiceImpl<TestMapper, Test> implements TestService {
    
    @Resource
    private TestMapper testMapper;
    
    /**
     * 分页查询
     */
    IPage<Test> findPage(TestDTO dto) {
      	IPage<Test> iPage = new Page<>(dto.getPageNum(), dto.getPageSize());
        QueryWrapper<Test> queryWrapper = new QueryWrapper<>();
        // ...
    	testMapper.selectPage(iPage, queryWrapper);
        return iPage;
    }
}
```



## Mybatis-Plus 分页配置

系统分页基于 Mybatis-Plus 的 分页插件 [官方文档](https://baomidou.com/plugins/pagination/) 项目中在 `lihua-base` - `lihua-mybatis` - `com/lihua/mybatis/config/MybatisPlusConfig.java` 中配置了分页插件，可按需修改

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

## Mybatis-Plus 数据自动填充
项目中在 `lihua-base` - `lihua-mybatis` - `com/lihua/mybatis/handle/AutoFillHandler.java` 中配置了基础字段的数据自动填充，继承了 `BaseEntity` 的对象在插入/更新时会自动填充 `创建人`、`创建时间`、`逻辑删除标识`、`更新人`、`更新时间`

```java 
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

