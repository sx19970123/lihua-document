# Websocket

1.3.0 版本为支持移动端的实时通信，将SSE替换为Websocket

## 发送消息

发送消息注入 `WebSocketManager` 后调用 `send()` 方法发送，根据重载参数不同，可向指定用户、用户群、所有用户发送消息

::: info

为保证规范性，发送的消息需要使用 `WebSocketResult` 对象进行包装，其构造函数接收 `Type` 和 `Data` 两个参数，Type为 `WebSocketMsgTypeEnum` 下定义的枚举；Data要求为可序列化对象

:::

``` java
// 注入 WebSocketManager
@Resource
private WebSocketManager webSocketManager;

List<Data> data

// 向全部用户发送通知
webSocketManager.send(new WebSocketResult<>(WebSocketMsgTypeEnum.WS_NTYPE, data));

// 向指定用户发送消息
List<String> userIds
webSocketManager.send(userIds, new WebSocketResult<>(WebSocketMsgTypeEnum.WS_NTYPE, data));
```



## 接收消息

收到消息后会进入`WebSocketManager` 中 `handleTextMessage` 方法

目前项目没有做特殊处理，可根据业务需要扩展，使用`Spring Event` 或 ` 消息队列`向业务分发



## 配置

在 `lihua-core/src/main/java/com/lihua/config/WebSocketConfig.java` 中对 WebSocket进行了配置，指定了连接路径和拦截器等

``` java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Resource
    private WebSocketManager webSocketManager;

    @Resource
    private WebSocketInterceptor webSocketInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketManager, "/ws-connect")
                .addInterceptors(webSocketInterceptor)
                .setAllowedOriginPatterns("*");
    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(512 * 1024);
        container.setMaxBinaryMessageBufferSize(512 * 1024);
        return container;
    }

}
```



## 拦截器

在 `lihua-core/src/main/java/com/lihua/interceptor/WebSocketInterceptor.java` 中对连接握手进行拦截。因客户端发起连接时无法携带 token，防止恶意连接，客户端每次连接前会向后台请求一个一次性token，携带该token认证后才可放行连接

``` java
@Slf4j
@Component
public class WebSocketInterceptor implements HandshakeInterceptor {

    @Resource
    private RedisCache redisCache;

    /**
     * 握手前处理
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        MultiValueMap<String, String> params = UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams();

        if (params.isEmpty() || !params.containsKey("token") || !params.containsKey("clientId") || !params.containsKey("clientType")) {
            log.error("webSocket握手失败，参数缺失");
            return false;
        }

        // 从参数中解析拿到token
        String key = RedisKeyPrefixEnum.ONCE_TOKEN_REDIS_PREFIX.getValue() + params.getFirst("token");
        String userId = redisCache.getCacheObject(key, String.class);

        if (StringUtils.isEmpty(userId)) {
            log.error("webSocket握手失败，不存在的token");
            return false;
        }

        // 删除一次性token
        redisCache.delete(key);

        // 从参数拿到用户id、客户端id、客户端类型
        attributes.put("userId", userId);
        attributes.put("clientId", params.getFirst("clientId"));
        attributes.put("clientType", params.getFirst("clientType"));

        log.info("WebSocket握手完成");
        return true;
    }

    /**
     * 握手后处理
     */
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {

    }
}
```

