# Mapper 开发

复杂的多表查询需在xml中手写SQL



## 接口

mapper 接口继承 `BaseMapper` 泛型为实体类

``` java
public interface SysAttachmentMapper extends BaseMapper<SysAttachment> {

    List<String> queryDeletablePathByIds(@Param("ids") List<String> ids);

}
```



## XML

为保证Mapper层与Service层结构一致，将xml文件放置到了mapper包下

![image-20241019160900602](./mapper.assets/image-20241019160900602.png)



## 配置

xml 放在 java 目录下需要在各服务 `application.yml` 中指定扫描路径（system、file 服务均已配置）：

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

新建模块请在启动类（如 `LiHuaSystemApplication`）下 `@MapperScan` 注解中新增对应mapper路径，防止扫描不到Mapper

``` java
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

