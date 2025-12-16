# 状态管理

> 与web端保持一致，app使用 pinia 作为状态管理工具

多个页面公用数据可在store中进行保存，当前项目未配置store持久化，app进程关闭即清空



## 项目store

### 用户（user）

- 获取用户相关信息：id、昵称、用户名、头像、角色、权限、部门、岗位

- 提供用户相关方法：登录、退出登录、修改密码、认证失效、初始化用户信息、修改默认部门、清空用户信息、处理头像、获取默认头像

### 字典（dict）

保存字典相关数据，一般业务组件中不主动调用，通过`utils/Dict`来获取字典

### 通知（notice）

- 获取消息通知相关信息：未读数量、是否tabBar上显示红点
- 提供消息通知相关方法：获取未读数量、预览、已读标记、处理红点

### 根节点（root）

因uniapp没有vue意义上的根节点，项目中引入了`uni-ku/root` 组件来实现全局根节点

在rootStore中可在全局获取root节点的ref

### 主题（theme）

- 获取主题相关信息：当前主题
- 提供主题相关方法：设置主题



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

   

