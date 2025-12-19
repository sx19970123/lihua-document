# 指令

在 `src/directive` 下定义了自定义指令

## 项目内置指令

### 权限相关

`v-hasRole` 当前登录用户拥有指定角色才进行dom元素加载

``` vue
<a-button v-hasRole="['ROLE_admin','ROLE_manager']"> 查 询 </a-button>
```

`v-hasPermission`当前登录用户拥有指定权限才进行dom元素加载

``` vue
<a-button v-hasPermission="['sys:dept:query',sys:dept:all']"> 查 询 </a-button>
```

### 鼠标滚轮禁用

`v-rollDisable` 禁用鼠标滚轮事件，在标记` v-rollDisable="true"` 的元素上，无法使用鼠标滚轮

``` vue
<a-button v-rollDisable="true"> 查 询 </a-button>
```

### 元素拖拽

`v-draggable` 将当前元素变为可拖拽元素

在 `a-modal` 组件下无需添加参数（a-modal 标签本身无法添加指令，指令需要添加到内部元素上）

``` html
<a-modal>
  <template #title>
    <div style="margin-bottom: 24px" v-draggable>
      <a-typography-title :level="4">{{modalActive.title}}</a-typography-title>
    </div>
  </template>
</a-modal>
```

非 `a-modal` 组件需要传入自定义的class名称（.开头）

``` html
<div class="draggable" v-draggable=".draggable">
    xxx
</div>
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

