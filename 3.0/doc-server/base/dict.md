# 系统字典

系统字典模块，提供字典通用部分能力。3.0 中字典缓存升级为 本地缓存 → Redis → 数据库 的多级链路，并新增 `DictDataLoader` 回源通道。

## 工具方法

### getLabel（根据类型和值获取标签）

```java
String label = DictUtils.getLabel("user_status", "1");
```

- 参数：dictTypeCode - 字典类型编码，value - 字典值
- 返回值：String 字典标签
- 说明：根据字典类型和value获取对应的label，未匹配到返回null

### getValue（根据类型和标签获取值）

```java
String value = DictUtils.getValue("user_status", "启用");
```

- 参数：dictTypeCode - 字典类型编码，label - 字典标签
- 返回值：String 字典值
- 说明：根据字典类型和label获取对应的value，未匹配到返回null

### getDictData（根据类型获取字典集合）

```java
List<DictDataModel> list = DictUtils.getDictData("user_status");
```

- 参数：dictTypeCode - 字典类型编码
- 返回值：List\<DictDataModel\> 字典数据集合
- 说明：优先取本地缓存（Caffeine），未命中再取Redis，仍无数据时经 `DictDataLoader` 回源查库并重建缓存；查库也无数据时以空列表写入本地负缓存，避免无数据字典每次回源

### resetCacheDict（根据类型重新缓存字典集合）

```java
int count = DictUtils.resetCacheDict("user_status");
```

- 参数：dictTypeCode - 字典类型编码
- 返回值：int 查询到的数据条数
- 说明：重新加载指定字典类型的数据并刷新缓存（刷新前广播本地缓存失效），字典数据变更后可调用此方法主动刷新

### resetCacheDict（批量根据类型重新缓存字典集合）

```java
int count = DictUtils.resetCacheDict(Arrays.asList("user_status", "gender"));
```

- 参数：dictTypeCodeList - 字典类型编码集合
- 返回值：int 查询到的数据总条数
- 说明：批量重新加载字典数据并刷新对应缓存

## 回源通道

`DictDataLoader` 为字典缓存回源通道接口，接口属于字典域（消费者），回源查询实现由持有 `sys_dict_data` 表的服务提供

``` java
public interface DictDataLoader {

    /**
     * 按字典类型编码批量查询生效字典数据
     */
    List<DictDataModel> queryByDictTypeCode(List<String> dictTypeCodeList);
}
```

- 本仓中由 `lihua-system` 的 `DictDataLoaderImpl` 提供持表实现，`@ComponentScan` 自动注册为 `DictUtils` 的回源通道
- 当前服务未注册回源通道时，`getDictData`/`resetCacheDict` 会显式抛出异常，不会把「无通道」伪装成「查无数据」

## 缓存链路

1. `getDictData` 先查本地缓存（Caffeine），命中直接返回
2. 本地未命中查 Redis，空集合按未命中处理（防新部署场景 Redis 未预热时被空结果阻断回源）
3. 均未命中时经 `DictDataLoader` 查库重建 Redis 缓存，并回填本地缓存
4. 字典数据管理侧变更时调用 `resetCacheDict` 刷新，同时经发布订阅广播 `invalidate_local_cache`，让所有实例的本地缓存同步失效
