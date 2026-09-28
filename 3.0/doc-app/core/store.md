# 状态管理

与web端保持一致，app使用 pinia 作为状态管理工具，store 均为 options 式定义

多个页面公用数据可在store中进行保存，当前项目未配置store持久化，app进程关闭即清空（个别需要持久化的数据如主题模式，由 store 内部自行读写 storage）



## 项目store

### 用户（user）

- 获取用户相关信息：id、昵称、用户名、头像、角色、权限、部门、岗位、permissionUpdate（权限待更新标志）
- 提供用户相关方法：退出登录（handleLogout）、认证失效（authenticationFailure）、初始化用户信息（initUserInfo，在途 Promise 去重，防并发导航重复请求）、更新默认部门（updateDefaultDept）、清空用户信息（clearUserInfo）、处理头像（handleAvatar，image 类型头像下载为临时路径）、获取默认头像（getDefaultAvatar）

### 字典（dict）

以 Map 结构缓存字典数据（getDict/setDict/clearDict），一般业务组件中不主动调用，通过`helpers/dict`的 `initDict` 来获取字典

### 通知（notice）

- 获取消息通知相关信息：未读数量（unreadCount）、是否tabBar上显示红点（isShowTabBarRedDot）
- 提供消息通知相关方法：获取未读数量（getUnreadCount，失败保持现值不抛错）、预览（previewNotice，releaseTime 经 dayjs 格式化）、已读标记（markAsRead，内部联动刷新未读数量）、处理红点（setTabbarRedDot）

### 设置（setting）

- 获取系统设置：是否启用验证码（enableCaptcha）、是否启用自助注册（enableSignUp）
- 提供初始化方法：`initBaseSetting()` 并行拉取两项开关，登录/注册页进入时调用

### 主题（theme）

- 获取主题相关信息：主题模式（mode：auto/dark/light，持久化在 storage 的 "UIStyle"）、系统主题（systemTheme）、是否暗色（isDark，auto 模式跟随系统）
- 提供主题相关方法：设置主题（setMode，App 端同步调用 `plus.nativeUI.setUIStyle`）、更新系统主题（setSystemTheme，由 `uni.onThemeChange` 驱动）

### 根节点（root）

因uniapp没有vue意义上的根节点，项目中引入了`@uni-ku/root` 组件来实现全局根节点

rootStore 通过 `getCurrentPages()` 取页面栈末位页面的 `$refs.uniKuRoot`，供全局拿到根节点实例（如原生通知下滑打开轻量通知抽屉）



## 使用store

在组件或ts文件中，引入对应store后初始化即可使用，例：

``` vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
// 引入store
import {useNoticeStore} from "@/stores/notice"
// 初始化store
const noticeStore = useNoticeStore()
// 使用store
onMounted(() => {
	noticeStore.getUnreadCount()
})
</script>
```



## 新建store

1. 在`src/stores/` 下新建对应ts文件

2. 在ts文件中引入 `import { defineStore } from "pinia";`

3. 指定id，定义state、actions后命名抛出

   ``` typescript
   // 引入 defineStore
   import { defineStore } from "pinia";
   
   // 定义 defineStore 后抛出 命名为 useXxxxxxStore
   export const useCustomStore = defineStore('custom', {
     // 定义属性
   	state: () => {
   		const data: any = undefined
   		return {
   			data
   		}
   	},
     // 定义方法
   	actions: {
   		handleData(data: any) {
   			this.data = data
   		}
   	}
   })
   ```

   

