# 依赖维护

> 非公共依赖应只在使用到的模块进行引入，多个模块公用的依赖可根据情况放到最外层pom
>
> 依赖管理同一从最外层进行

## 版本维护

在最外层pom的 `properties` 中定义了各个依赖的版本信息

``` xml
    <properties>
        <java.version>25</java.version>

        <project.version>3.0.0</project.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <mysql.version>26.7.0</mysql.version>
        <mybatis-plus.version>3.5.17</mybatis-plus.version>
        <jwt.version>4.6.0</jwt.version>
        <redisson.version>4.7.0</redisson.version>
        <caffeine.version>3.2.4</caffeine.version>
        <tianai-captcha.version>1.5.5</tianai-captcha.version>
        <ip2region.version>3.3.7</ip2region.version>
        <dynamic-datasource.version>4.5.0</dynamic-datasource.version>
        <fesod.version>2.0.2-incubating</fesod.version>
        <oss.version>3.18.5</oss.version>
        <spring-doc.version>3.1.0</spring-doc.version>
        <snail-job.version>2.0.2</snail-job.version>
    </properties>
```

> 项目 parent 为 `spring-boot-starter-parent`（4.1.1），Spring 全家桶及大部分第三方依赖版本由 parent 统一仲裁，`properties` 中只维护 parent 未管理的依赖版本

使用时通过 `${fesod.version}` 引入

``` xml
<dependency>
    <groupId>org.apache.fesod</groupId>
    <artifactId>fesod-sheet</artifactId>
    <version>${fesod.version}</version>
</dependency>
```



## 静态文件

在最外层pom中`resources` 下可指定打入jar包的静态文件，`lihua-admin/src/main/resources` 下有静态文件需要在代码中使用时，需要在maven中进行添加，否则不会打入jar包

``` xml
<!--        指定打包后包含的文件-->
<resources>
    <resource>
        <directory>src/main/resources</directory>
        <includes>
            <include>**/*.properties</include>
            <include>**/*.xml</include>
            <include>**/*.yml</include>
            <include>**/*.txt</include>
            <include>META-INF/services/*</include>
            <include>META-INF/spring/*</include>
        </includes>
    </resource>
    <resource>
        <directory>src/main/java</directory>
        <includes>
            <include>**/*.properties</include>
            <include>**/*.xml</include>
        </includes>
    </resource>
</resources>
```

> 3.0 中模块私有的静态资源在各自模块的 pom 中维护：验证码图片/字体（`captcha-images/**`、`captcha-font/**`）在 `lihua-base-captcha` 中配置，ip2region 数据文件（`ip2region/**`）在 `lihua-base-web` 中配置
