# Layout



## Layout 结构

项目菜单栏、头部元素及view-tab 均属于Layout，位于项目`lihua-vue/src/layout/` 目录下，根据需求可自行修改

``` text
lihua-vue/src/layout/  
├── index.vue                   # 布局主入口，根据主题类型动态加载不同布局
├── content/               
│   └── index.vue               # 内容区域主组件
├── head/
│   ├── index.vue               # 头部主组件
│   └── components/  
│       ├── breadcrumb/         # 面包屑导航
│       ├── collapsed/          # 菜单收缩按钮
│       ├── dept/   			# 默认部门选择器  
│       ├── menu-search/        # 菜单搜索  
│       ├── notice/     		# 消息通知  
│       ├── user/               # 用户信息组件  
│       └── windows-change/     # 全屏切换组件  
├── layout-type/ 
│   ├── MixNavigation.vue       # 混合导航布局
│   ├── SideNavigation.vue      # 侧边导航布局
│   └── TopNavigation.vue       # 顶部导航布局
├── logo/                       
│   └── index.vue               # Logo主组件
├── sider/                       
│   └── index.vue               # 侧边栏主组件
└── view-tabs/                   
    ├── index.vue               # 标签页主组件
    └── components/
    		├── TabPaneMenu.vue	# 标签页元素及右键菜单
        └── TabRightMenu.vue    # 标签页右键菜单
```



## 修改系统标题

![image-20241111194950190](./layout.assets/image-20241111194950190.png)

- 修改网站Logo及标题

  在项目根目录下`index.html`文件中，通过修改`link` 标签的`href`图片路径修改网站Logo；通过修改`title` 中内容修改网站名称。

  ![image-20241111195300670](./layout.assets/image-20241111195300670.png)

- 修改导航栏Logo及标题

  在项目`src/layout/logo/index.vue` 组件中定义了导航Logo及标题。导航Logo分为两部分，一部分为大多数时候展示的Logo + 标题形式；另一部分为侧标导航（风格1）折叠后显示的Logo。可通过修改`<a-avatar/>` 组件来定义导航Logo，修改`<a-typography-title/>` 组件文本内容来定义导航标题。[a-avatar用法参考](https://antdv.com/components/avatar-cn)

  ![image-20250117135114378](./layout.assets/image-20250117135114378.png)

  

### 