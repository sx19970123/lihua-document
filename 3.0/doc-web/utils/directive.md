# 指令

在 `src/directive` 下定义了自定义指令，经 `directive/index.ts` 通过 `import.meta.glob` 自动注册（在 `src/directive` 下新建指令文件即可生效，无需手动接线）

## 项目内置指令

### 权限相关

`v-hasRole` 当前登录用户拥有指定角色才进行dom元素加载

``` vue
<a-button v-hasRole="['ROLE_admin','ROLE_manager']"> 查 询 </a-button>
```

`v-hasPermission`当前登录用户拥有指定权限才进行dom元素加载

``` vue
<a-button v-hasPermission="['system:user:add']"> 查 询 </a-button>
```

实现说明：指令在 `mounted` 钩子中比对 userStore 中的 `roleCodes` / `permissions` 集合，传入数组中存在任一未持有的编码即执行 `el.remove()` 将元素从 DOM 中移除。注意元素移除发生在挂载时，不支持响应式切换；参数必须为字符串数组，否则控制台报参数错误

``` typescript
export default (app:App<Element>):void => {
  app.directive('hasPermission',{
    mounted: (el, binding) => {
      const currentPerms = cloneDeep(userStore.$state.permissions)
      const value = binding.value
      if (Array.isArray(value)) {
        if (value) {
          for (const permission of value as string[]) {
            if (!currentPerms.includes(permission)) {
              el.remove()
              break
            }
          }
        }
      } else {
        console.error('v-hasPermission 指令: 参数错误，请传入字符串数组，例 v-hasPermission="[\'xxx:xxx:xxx\']"')
      }
    }
  })
}
```

## 新增指令

在`src/directive`下新建ts文件，导出 `export default (app: App<Element>): void =>` 函数，函数中接收`app` 参数，使用 `app.directive()` 指定指令

``` typescript
import {type App} from 'vue';

export default (app: App<Element>): void => {
    app.directive('name', {
      	// 元素加载时 el 获取到元素，binding获取到参数
        mounted(el, binding) {
        },
      	// 元素销毁时
        unmounted(el) {
        },
    });
};
```
