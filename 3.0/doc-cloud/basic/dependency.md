# 依赖维护

> 非公共依赖应只在使用到的模块进行引入，多个模块公用的依赖可根据情况放到最外层pom
>
> 依赖管理统一从最外层进行

## 版本维护

在最外层pom的 `properties` 中定义了各个依赖的版本信息

``` xml
     <properties>
        <java.version>25</java.version>

        <project.version>3.0.0</project.version>
        <spring-cloud.version>2025.1.3</spring-cloud.version>
        <spring-cloud-alibaba.version>2025.1.0.0</spring-cloud-alibaba.version>
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
        <spring-doc.version>3.0.3</spring-doc.version>
        <snail-job.version>2.0.2</snail-job.version>
    </properties>
```

Spring Boot / Spring Cloud / Spring Cloud Alibaba 三个大版本通过 `dependencyManagement` + BOM 导入管理：

``` xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.8</version>
        <relativePath/>
    </parent>

    <dependencyManagement>
        <dependencies>
            <!--        spring-cloud-->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!--        spring-cloud-alibaba-->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!-- lihua-base 各基础模块 与 lihua-api-system 同样在此统一管理版本 -->
        </dependencies>
    </dependencyManagement>
```

使用时通过 `${fesod.version}` 引入

``` xml
<dependency>
    <groupId>org.apache.fesod</groupId>
    <artifactId>fesod-sheet</artifactId>
    <version>${fesod.version}</version>
</dependency>
```



## 静态文件

在模块 pom 的 `build.resources` 中可指定打入jar包的静态文件，例如 `lihua-base-captcha` 下有验证码图片、字体等静态资源需要在代码中使用，需要在对应模块maven中进行添加，否则不会打入jar包

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

验证码模块额外维护了 `captcha-images/**`、`captcha-font/**` 两个静态资源目录，Web 模块维护了 `ip2region/**` IP 归属地数据文件，均需在其模块 pom 的 resources 中声明。

