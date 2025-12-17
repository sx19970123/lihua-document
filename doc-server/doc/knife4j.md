# Knife4j 文档

系统集成了knife4j 文档，在`application-dev.yml` 和 `application-prod.yml` 中可对开发生产环境进行分别配置，更多配置及使用参考 [官方文档](https://doc.xiaominfo.com/docs/quick-start)



## 配置文件

``` yaml
# springdoc-openapi项目配置
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
  api-docs:
    path: /v3/api-docs
# knife4j的增强配置，不需要增强可以不配
knife4j:
  enable: true
# 生产模式打开，防止接口泄漏
  production: true
  setting:
    language: zh_cn
```



## 配置类

knife4j 配置类 `com.lihua.config.Knife4jConfig` 中可自定义接口描述信息、接口分组配置等

``` java
/**
 * Knife4 接口文档配置类
 */
@Configuration
public class Knife4jConfig {

    @Resource
    private LihuaConfig lihuaConfig;

    /**
     * 接口描述信息
     */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI().info(new Info()
                .title("狸花猫后台管理系统接口文档")
                .description("接口分组配置com.lihua.config.Knife4jConfig，可自定义接口描述及接口分组")
                .contact(new Contact().name("Yukino"))
                .version(lihuaConfig.getVersion()));
    }

    /**
     * 接口分组配置（system）
     */
    @Bean
    public GroupedOpenApi systemApi() {
        return GroupedOpenApi.builder()
                .group("系统接口")
                .packagesToScan("com.lihua.controller.system")
                .build();
    }

    /**
     * 接口分组配置（monitor）
     */
    @Bean
    public GroupedOpenApi monitorApi() {
        return GroupedOpenApi.builder()
                .group("监控接口")
                .packagesToScan("com.lihua.controller.monitor")
                .build();
    }
}
```

## 查看文档

后端项目启动后访问 `http://ip:端口/doc.html` 即可查看接口文档，例如http://localhost:8080/doc.html