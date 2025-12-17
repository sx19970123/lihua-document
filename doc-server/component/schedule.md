# 定时任务

> 定时任务基于XXL - JOB，调度中心需单独部署。详情[官方文档](https://www.xuxueli.com/xxl-job/)

**本项目（执行器）application.yml 中对 xxl-job 的配置**

``` yaml
xxl-job:
  # 是否启用定时任务
  enable: false
  # 调度中心部署地址
  adminAddress: http://127.0.0.1:8081/xxl-job-admin
  # 执行器通讯token
  accessToken: default_token
  # 执行器应用名称
  appName: lihua
  # 执行器注册地址
  address:
  # 执行器ip
  ip:
  # 执行器端口号
  port: 0
  # 执行器日志保存目录
  logPath: D:/home/lihua/job-logs
  # 执行器日志保存天数
  logRetentionDays: 30

```

**系统中使用定时任务**

通过`@XxlJob`注解可让XXL-JOB调度中心调用到此方法。（定时任务方法无法获取到用户上下文！（没有登录嘛））

``` java
@Component
@Slf4j
public class SseHeartbeat {

    /**
     * 保持SSE连接，定时向客户端发送数据
     * 通过定时任务定期执行
     */
    @XxlJob("keepHeartbeat")
    public void keepHeartbeat () {
        String name = ServerSentEventsEnum.SSE_HEART_BEAT.name();
        log.info(name);
        ServerSentEventsManager.send(new ServerSentEventsResult<>(ServerSentEventsEnum.SSE_HEART_BEAT, name));
    }
}
```

