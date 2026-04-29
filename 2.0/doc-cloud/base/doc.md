# 接口文档

基于 Spring Doc 的接口文档，此模块可对 Spring Doc 进行配置。业务模块使用时，注解请参考[官方文档](https://springdoc.org/)。



## 配置文件

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对附件进行配置

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

