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



## Mybatis-Plus 配置

系统分页基于 Mybatis-Plus 的 分页插件 [官方文档](https://baomidou.com/plugins/pagination/) 项目中在 `lihua-core/src/main/java/com/lihua/config/MybatisPlusConfig.java` 中配置了分页插件，可按需修改

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

