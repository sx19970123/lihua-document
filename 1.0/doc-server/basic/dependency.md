# 依赖维护

> 非公共依赖应只在使用到的模块进行引入，多个模块公用的依赖可根据情况放到最外层pom
>
> 依赖管理同一从最外层进行

## 版本维护

在最外层pom的 `properties` 中定义了各个依赖的版本信息

``` xml
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>

        <lihua.version>1.3.0</lihua.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <mysql.version>8.2.0</mysql.version>
        <mybatis-plus.version>3.5.14</mybatis-plus.version>
        <jwt.version>3.10.3</jwt.version>
        <myexcel.version>4.5.6</myexcel.version>
        <oshi.version>6.6.4</oshi.version>
        <guava.version>33.3.1-jre</guava.version>
        <xxl-job.version>3.3.0</xxl-job.version>
        <tianai-captcha.version>1.5.3</tianai-captcha.version>
        <minio.version>8.6.0</minio.version>
        <okhttp3.version>5.1.0</okhttp3.version>
        <knife4j.version>4.5.0</knife4j.version>
        <ipaddress.version>5.5.1</ipaddress.version>
        <ip2region.version>3.2.0</ip2region.version>
        <dynamic-datasource.version>4.3.1</dynamic-datasource.version>
    </properties>
```

使用时通过 `${knife4j.version}` 引入

``` xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>${knife4j.version}</version>
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
            <include>captcha-images/**</include>
            <include>captcha-font/**</include>
            <include>ip2region/**</include>
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

