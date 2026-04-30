# 网关

网关层基于 `spring cloud gateway` 从配置文件 `lihua-gateway.yaml` 可进行路由转发规则的配置。

## 过滤器
网关作为微服务入口，适合前置处理一些通用请求校验。项目中使用全局过滤器进行了简单的token校验和ip黑名单的过滤，
位于 `lihua-gateway/src/main/java/com/lihua/gateway/filter` 目录下。