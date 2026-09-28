# 接口文档

基于 Spring Doc 的接口文档，此模块可对 Spring Doc 进行配置。业务模块使用时，注解请参考[官方文档](https://springdoc.org/)。



## 配置文件

公共基础配置在 Nacos 的 `lihua-common.yaml` 中（各服务共享，生产环境 `enabled` 置 false 整体关闭）：

``` yaml
# spring doc 接口文档
springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
    display-request-duration: true
```

各服务在自身 yaml 中覆盖 `springdoc.swagger-ui.url/configUrl` 以适配网关的文档前缀路由（如 system 服务覆盖为 `/system/v3/api-docs`，**url 与 configUrl 必须同前缀**，否则经网关 404 报 "Failed to load remote configuration"）：

``` yaml
springdoc:
  swagger-ui:
    url: /system/v3/api-docs
    configUrl: /system/v3/api-docs/swagger-config
```

网关侧的文档路由（按前缀匹配后 `RewritePath` 剥前缀转发）见 [网关](/3.0/doc-cloud/standard/gateway#swagger-文档聚合)。服务端默认路径无前缀，经网关不可达，需查看原始文档时走服务直连端口访问。



## 配置类

yml配置文件不满足个性化配置时可使用配置类进行额外配置

``` java
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.version}")
    private String version;

    @Bean
    public OpenAPI customOpenAPI() {
        // token配置
        SecurityScheme securityScheme = new SecurityScheme()
                .name("Authorization")
                .type(SecurityScheme.Type.HTTP).scheme("bearer")
                .bearerFormat("JWT");

        return new OpenAPI()
                .components(new Components().addSecuritySchemes("BearerAuth", securityScheme))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                // 基础信息配置
                .info(new Info().title("狸花猫后台管理系统 API").version(version).description("接口文档"));
    }

}
```

