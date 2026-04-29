# 系统字典

系统字典模块，提供字典通用部分能力。

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

### setDictCache（根据类型缓存）

```java
DictUtils.setDictCache("user_status", dictList);
```

- 参数：dictTypeCode - 字典类型编码，dictValue - 字典数据集合
- 返回值：无
- 说明：将指定字典数据写入Redis缓存

### removeDictCache（根据类型删除缓存）

```java
DictUtils.removeDictCache("user_status");
```

- 参数：dictTypeCode - 字典类型编码
- 返回值：无
- 说明：删除指定字典类型的缓存数据

### getDictData（根据类型获取字典集合）

```java
List<DictDataModel> list = DictUtils.getDictData("user_status");
```

- 参数：dictTypeCode - 字典类型编码
- 返回值：List\<DictDataModel\> 字典数据集合
- 说明：优先从缓存获取字典数据，缓存不存在时自动从数据库加载并重建缓存

### resetCacheDict（根据类型重新缓存字典集合）

```java
int count = DictUtils.resetCacheDict("user_status");
```

- 参数：dictTypeCode - 字典类型编码
- 返回值：int 查询到的数据条数
- 说明：重新加载指定字典类型的数据并刷新缓存

### resetCacheDict（批量根据类型重新缓存字典集合）

```java
int count = DictUtils.resetCacheDict(Arrays.asList("user_status", "gender"));
```

- 参数：dictTypeCodeList - 字典类型编码集合
- 返回值：int 查询到的数据总条数
- 说明：批量重新加载字典数据并刷新对应缓存
