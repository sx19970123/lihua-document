# 用户展示

需要展示用户的场景使用



#### 基础用法

引入组件`import UserShow from "@/components/user-show/index.vue"`，通过传入`avatar-json`、`nickname`展示用户信息

![image-20241222162156248](./user-show.assets/image-20241222162156248.png)

```vue
<template>
  <a-typography-title :level="4">基础用法</a-typography-title>
  <user-show :avatar-json="userStore.$state.userInfo.avatar" :nickname="userStore.$state.nickname" />
</template>

<script setup lang="ts">
import UserShow from "@/components/user-show/index.vue"
import {useUserStore} from "@/stores/user.ts";
const userStore = useUserStore();
</script>
```

#### 多用户

通过a-flex组件配合 wrap="wrap" 属性包裹 user-show 组件，使用 v-for 循环 user-show 即可

![image-20241222162327044](./user-show.assets/image-20241222162327044.png)

```vue
<template>
  <div>
    <a-typography-title :level="4">多位用户</a-typography-title>
      <a-row>
        <a-col :span="6">
          <a-card v-if="userList.length > 0">
            <a-flex wrap="wrap" gap="small">
              <user-show
                  v-for="user in userList"
                  :avatar-json="user.avatar"
                  :nickname="user.nickname"/>
            </a-flex>
          </a-card>
        </a-col>
      </a-row>
  </div>
</template>

<script setup lang="ts">
import UserShow from "@/components/user-show/index.vue"
import {queryPage} from "@/api/system/user/User.ts";
import {onMounted, ref} from "vue";
import type {SysUserVO} from "@/api/system/user/type/SysUser.ts";
const userList = ref<SysUserVO[]>([])
onMounted(async () => {
  const resp = await queryPage({pageNum: 1, pageSize: 20})
  if (resp.code === 200) {
    userList.value = resp.data.records
  }
})

</script>
```

### API

#### 属性

| 属性名称   | 描述                                                       | 类型   | 默认值 | 是否必填 |
| ---------- | ---------------------------------------------------------- | ------ | ------ | -------- |
| avatarJson | 用户头像json字符串（从sys_user表中直接获取avatar字段即可） | string | -      | 否       |
| nickname   | 用户昵称                                                   | string | -      | 否       |