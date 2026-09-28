# 核心业务服务 lihua-system

RBAC 核心业务：用户/角色/菜单/部门/岗位、字典、通知公告、系统日志、系统设置，同时承担 WebSocket 推送与定时任务接入。是五个服务中唯一的数据 Owner（sys_\* 业务表），为其他服务提供 RPC 数据支撑。

## 基本信息

| 项目 | 值 |
| ---- | -- |
| spring.application.name | `lihua-system` |
| 默认端口 | `8084`（`SERVER_PORT` 环境变量可覆盖） |
| 启动类 | `com.lihua.system.LiHuaSystemApplication` |
| 依赖中间件 | MySQL（sys_\* 业务表）、Redis、Nacos |
| Nacos 配置 | `lihua-system.yaml`（`lihua-system` 分组）+ `lihua-common.yaml` + `lihua-resilience.yaml` |

## 模块结构

```text
lihua-system/
└── src/main/java/com/lihua/system/
    ├── LiHuaSystemApplication.java        # 启动类（@MapperScan + @ComponentScan）
    ├── controller/                        # 管理版接口（/system/**）
    │   ├── SysUserController.java         # 用户
    │   ├── SysRoleController.java         # 角色
    │   ├── SysMenuController.java         # 菜单
    │   ├── SysDeptController.java         # 部门
    │   ├── SysPostController.java         # 岗位
    │   ├── SysNoticeController.java       # 通知公告（管理端维护端点）
    │   ├── SysAppVersionController.java   # App 版本管理（检查更新）
    │   ├── SysDictTypeController.java     # 字典类型
    │   ├── SysDictDataController.java     # 字典数据
    │   ├── SysLogController.java          # 系统日志
    │   ├── SysSettingController.java      # 系统设置
    │   ├── SysProfileController.java      # 个人中心
    │   ├── SysViewTabController.java      # 页签
    │   ├── SysUserAuthController.java     # 认证 RPC 端点（@InternalOnly）
    │   ├── base/                          # 双版本共有端点基类（BaseSysNoticeController 等）
    │   └── app/                           # App 版接口（/app/system/**，继承 base 基类）
    ├── entity/                            # 数据库实体
    ├── enums/                             # NoticeStatusEnum 等
    ├── loader/
    │   ├── DictDataLoaderImpl.java        # 字典缓存回源本地实现（@Primary）
    │   └── LogClientLocalImpl.java        # 日志落库本地实现（@Primary）
    ├── mapper/ + mapper/xml/              # 持久层（xml 与 mapper 同包维护）
    ├── model/                             # dto / vo / validation
    ├── strategy/
    │   ├── cacheloginuser/                # 登录缓存策略组
    │   ├── postlogincheck/                # 登录后检查策略组
    │   └── saveuserregister/              # 注册保存关联策略组
    └── service/ + service/impl/           # 业务层
```

## 核心机制

### 双版本路由

管理端（Web）与 App 端接口同构：`controller/base` 下基类承载共有端点（对外行为一致，差异仅在路由前缀与文档分组），`controller/SysXxxController`（`/system/**`）与 `controller/app/AppSysXxxController`（`/app/system/**`）分别继承。管理版子类自行声明维护端点（App 不提供的增删改端点）。

### 策略模式三组

- **cacheloginuser**（登录缓存）：登录/数据更新时组装用户上下文——部门、岗位、角色、菜单、其他信息各一个实现（`CacheDeptStrategyImpl` 等），逐个向 `LoginUserSession` 填充数据
- **postlogincheck**（登录后检查）：登录成功后的业务检查——默认部门检查、密码到期更新提醒、用户基础信息校验（`DefaultDeptStrategyImpl` 等）
- **saveuserregister**（注册保存关联）：注册用户新建时的关联数据初始化——部门、岗位、角色（`SaveDeptStrategyImpl` 等）

新增同类扩展点时实现对应策略接口并注册为 `@Component` 即可被自动发现，无需改动主流程。

### 数据回源双通道

`lihua-base-dict` 与 `lihua-base-log` 各定义了 SPI 接口，本服务提供 `@Primary` 本地实现直查数据库；其他服务经 `lihua-api-system` 的 RPC 实现（Facade）回源，业务代码无感知：

- `DictDataLoaderImpl`（`@Primary`）：字典缓存回源直查 `sys_dict_data`，对应 RPC 版 `SysDictDataClientFacade`
- `LogClientLocalImpl`（`@Primary`）：日志落库直写 `sys_operate_log`/`sys_login_log`，对应 RPC 版 `SysLogClientFacade`（异步 fire-and-forget）

### 认证 RPC 端点

`SysUserAuthController`（`system/user/auth`，`@InternalOnly` 签名保护 + permitAll）供 lihua-auth 调用：`loginSelect/{username}`（登录校验取用户）、`queryLoginUserProfile`（拉取全量会话数据）、`register`。另有 `system/setting/cacheIpBlack` 等带 token 的 RPC 端点供各服务同步黑名单等数据。

## 通知公告 API 参考

通知公告是本服务最典型的双版本业务域，包含公告维护、发布推送、用户已读/标星、未读计数完整闭环。公告发布/撤销时经 `TransactionSendUtils.runAfterCommit` 在**事务提交后**通过 WebSocket（`WS_NOTICE`）实时推送给目标用户。

### 管理端（/system/notice）

`SysNoticeController` 继承 `BaseSysNoticeController`（用户侧端点）并追加维护端点，仅 Web 管理端提供：

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/system/notice/page` | POST | 分页查询公告（`@Validated(MaxPageSizeLimit.class)` 分页上限校验） |
| `/system/notice/{id}` | GET | 根据 id 查询详情 |
| `/system/notice/managePreview/{id}` | GET | 管理端预览公告（3.0 新增，不限制公告状态） |
| `/system/notice` | POST | 保存公告（`@Log SAVE`） |
| `/system/notice/release/{id}` | POST | 发布公告，事务提交后 WS 推送目标用户（`@Log OTHER`） |
| `/system/notice/revoke/{id}` | POST | 撤销公告（`@Log OTHER`） |
| `/system/notice` | DELETE | 批量删除（`@NotEmpty` 校验 id 集合，`@Log DELETE`） |
| `/system/notice/readInfo` | POST | 分页查询公告已读/未读用户 |

### 用户侧（/system/notice 与 /app/system/notice）

`BaseSysNoticeController` 承载用户侧端点，管理版与 App 版行为一致：

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `preview/{id}` | GET | 根据 id 预览公告（仅已发布公告） |
| `list` | POST | 用户查询自己的通知公告（含已读/标星状态，分页） |
| `star/{noticeId}/{star}` | POST | 标星/取消标星公告 |
| `read/{noticeId}` | POST | 记录已读 |
| `unread/count` | GET | 获取未读总数（前端红点数据源） |

### 参考代码

**管理端维护端点**（`SysNoticeController`，3.0 新增 managePreview 与发布推送链路）：

``` java
@Tag(name = "通知公告")
@RestController
@RequestMapping("system/notice")
@Validated
public class SysNoticeController extends BaseSysNoticeController {

    @Operation(summary = "分页查询")
    @PostMapping("page")
    public ApiResponseModel<IPage<SysNotice>> queryPage(@RequestBody @Validated(MaxPageSizeLimit.class) SysNoticeDTO sysNoticeDTO) {
        return success(sysNoticeService.queryPage(sysNoticeDTO));
    }

    @Operation(summary = "管理端预览通知公告（不限制公告状态）")
    @GetMapping("managePreview/{id}")
    public ApiResponseModel<SysNoticeVO> managePreview(@PathVariable("id") String id) {
        return success(sysNoticeService.managePreview(id));
    }

    @Operation(summary = "保存通知公告")
    @PostMapping
    @Log(description = "保存通知公告", type = LogTypeEnum.SAVE)
    public ApiResponseModel<String> save(@RequestBody @Validated SysNoticeDTO sysNoticeDTO) {
        return success(sysNoticeService.save(sysNoticeDTO));
    }

    @Operation(summary = "发布通知公告")
    @PostMapping("release/{id}")
    @Log(description = "发布通知公告", type = LogTypeEnum.OTHER)
    public ApiResponseModel<String> release(@PathVariable("id") String id) {
        return success(sysNoticeService.release(id));
    }

    @Operation(summary = "删除通知公告")
    @DeleteMapping
    @Log(description = "删除通知公告", type = LogTypeEnum.DELETE)
    public ApiResponseModel<String> deleteByIds(@RequestBody @NotEmpty(message = "请选择数据") List<String> ids) {
        sysNoticeService.deleteByIds(ids);
        return success();
    }

    @Operation(summary = "分页查询已读/未读用户")
    @PostMapping("readInfo")
    public ApiResponseModel<IPage<SysUser>> queryReadInfo(@RequestBody @Validated({Default.class, MaxPageSizeLimit.class}) NoticeReadInfoDTO readInfoDTO) {
        return success(sysUserNoticeService.queryReadInfo(readInfoDTO));
    }
}
```

**发布时事务提交后 WS 推送**（`SysNoticeServiceImpl`）：

``` java
// 全体公告：事务提交后向所有在线用户推送；定向公告：事务提交后向目标用户推送
TransactionSendUtils.runAfterCommit(() -> webSocketManager.send(new WebSocketResult<>(WebSocketMsgTypeEnum.WS_NOTICE, sysNotice)));
TransactionSendUtils.runAfterCommit(() -> webSocketManager.send(userIds, new WebSocketResult<>(WebSocketMsgTypeEnum.WS_NOTICE, sysNotice)));
```

**用户侧基类端点**（`BaseSysNoticeController`，管理版与 App 版共有）：

``` java
public abstract class BaseSysNoticeController extends ApiResponseController {

    @Operation(summary = "根据id预览公告")
    @GetMapping("preview/{id}")
    public ApiResponseModel<SysNoticeVO> preview(@PathVariable("id") String id) {
        return success(sysNoticeService.preview(id));
    }

    @Operation(summary = "用户查询自己的通知公告")
    @PostMapping("list")
    public ApiResponseModel<IPage<SysUserNoticeVO>> userMessageList(@RequestBody SysNoticeDTO sysNoticeDTO) {
        return success(sysNoticeService.userMessageList(sysNoticeDTO));
    }

    @Operation(summary = "标星公告")
    @PostMapping("star/{noticeId}/{star}")
    public ApiResponseModel<String> changeStar(@PathVariable("noticeId") String noticeId, @PathVariable("star") String star) {
        sysUserNoticeService.changeStar(noticeId, star);
        return success();
    }

    @Operation(summary = "记录已读")
    @PostMapping("read/{noticeId}")
    public ApiResponseModel<String> changeRead(@PathVariable("noticeId") String noticeId) {
        sysUserNoticeService.changeRead(noticeId);
        return success();
    }

    @Operation(summary = "获取未读总数")
    @GetMapping("unread/count")
    public ApiResponseModel<Integer> queryUnReadCount() {
        return success(sysUserNoticeService.queryUnReadCount());
    }
}
```

## 接口一览

| 业务域 | 路由前缀 | 说明 |
| ------ | -------- | ---- |
| 用户 | `system/user` | 用户 CRUD、状态、重置密码、checkUserName |
| 认证支撑 | `system/user/auth` | RPC 端点（loginSelect / queryLoginUserProfile / register，签名保护） |
| 角色 | `system/role` | 角色 CRUD、菜单授权、用户授权 |
| 菜单 | `system/menu` | 菜单 CRUD、路由树 |
| 部门 | `system/dept` | 部门 CRUD、部门树 |
| 岗位 | `system/post` | 岗位 CRUD |
| 通知公告 | `system/notice` | 见上文 API 参考 |
| App 版本管理 | `system/app-version` | 版本维护、检查更新（`/app/system/app-version/check` 未登录可查） |
| 字典类型/数据 | `system/dictType` `system/dictData` | 字典维护、刷新缓存、queryByDictTypeCode（RPC） |
| 系统日志 | `system/log` | 登录/操作日志分页查询、login/insert operate/insert（RPC，签名保护） |
| 系统设置 | `system/setting` | 设置维护、base 放行项、cacheIpBlack（RPC）、GrayModelSetting |
| 个人中心 | `system/profile` | 个人资料、改密 |
| 页签 | `system/viewTab` | 多页签持久化 |

## 配置与注意事项

- 数据源在 `lihua-system.yaml` 配置（dynamic-datasource，MySQL 连接参数经 `MYSQL_ADDR/MYSQL_USERNAME/MYSQL_PASSWORD` 注入），**与 lihua-file 共用同一 MySQL 库，修改须同步另一份**
- 定时任务默认关闭：需要时在 `LiHuaSystemApplication` 上开启 `@EnableSnailJob` 并解除 `lihua-system.yaml` 中 snail-job 配置注释
- mapper xml 放在 java 目录的 mapper/xml 下，`mapper-locations` 已在 application.yml 声明
- WebSocket 端点 `/ws-connect` 位于本服务，网关以 `/ws-connect/**` 路由转发
- 容器部署时 system 端口为 **8082**（compose 内 `SERVER_PORT=8082`），与本地默认 8084 不同
