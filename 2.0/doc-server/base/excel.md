# Excel 模块

excel 导出导出基于fesod，根据系统情况做了工具和注解的封装，详细用法请参考[官方文档](https://fesod.apache.org/zh-cn/docs/)。



## 工具类

fesod提供更节省内存的导入导出方法，请根据自身业务需要自行实现

### export（导出）

```java
ExcelUtils.export(list, UserExportVO.class);
```

- 参数：exportData - 导出数据集合，clazz - 导出数据类型
- 返回值：无（直接写入HTTP响应流）
- 说明：将数据导出为Excel文件并写入HTTP响应流

### export（合并单元格导出）

```java
ExcelUtils.export(list, UserExportVO.class, new CustomMergeStrategy());
```

- 参数：exportData - 导出数据集合，clazz - 导出数据类型，mergeStrategy - 单元格合并策略
- 返回值：无（直接写入HTTP响应流）
- 说明：支持自定义单元格合并策略，同时自动识别注解实现下拉框和批注功能

### excelImport（导入）

```java
List<UserImportVO> list = ExcelUtils.excelImport(inputStream, UserImportVO.class);
```

- 参数：inputStream - Excel文件输入流，clazz - 解析的数据类型
- 返回值：List\<T\> 解析后的数据集合
- 说明：从Excel文件中读取数据并转换为指定类型对象集合

## 批注

使用注解指定批注信息

### @ExcelComment（指定批注）

``` java
@ExcelComment(value = "用户名必填且系统唯一")
private String username;
```

- 参数：value - 批注内容，use - 批注应用位置（全部/表头/内容），headRowNum - 表头行号（多级表头使用）
- 说明：用于Excel导出时为单元格添加批注，支持作用范围控制及多级表头位置指定

### @ExcelEnableComment（是否启用批注）

``` java
@ExcelEnableComment
public class SysUser extends BaseEntity{}
```

- 参数：无
- 说明：在实体类上标记，标记后该类的对应字段 `@ExcelComment` 将被应用



## 单元格下拉

使用注解指定单元格下拉信息

### @ExcelDropdown（设置下拉）

``` java
@ExcelDropdown(type = DropdownTypeEnum.DICT, value = "user_gender")
private String gender;
```

- 参数：type - 下拉类型（见DropdownTypeEnum），value - 下拉标识（如字典编码），options - 自定义下拉数据，max - 生效最大行数
- 说明：用于Excel导出时为单元格添加下拉选项，支持字典下拉和自定义下拉两种方式

### @ExcelEnableDropdown（是否启用单元格下拉）

``` java
@ExcelEnableDropdown
public class SysUser extends BaseEntity{}
```

- 参数：无
- 说明：在实体类上标记，标记后该类的对应字段 `@ExcelDropdown` 将被应用



## 字典翻译

字典翻译需要用到fesod 官方注解 `@ExcelProperty` 指定转换器 `converter` 为 `ExcelDictConverter.class`

另外需要自定义注解 `@ExcelDictType()` 传入字典类型编码，两个注解配合完成字典翻译

``` java
@ExcelProperty(value = "状态", converter = ExcelDictConverter.class)
@ExcelDictType("sys_status")
private String status;
```

字典翻译逻辑在 `ExcelDictConverter` 自定义转换器中



## 日期转换器

项目中还提供了 `LocalDateTime` 和 `LocalDate` 转换器，配合 `@ExcelProperty` 注解，导出时间｜日期数据时使用。

``` java
/**
 * 创建时间（操作时间）
 */
@ExcelProperty(value = "操作时间", converter = ExcelLocalDateTimeConverter.class)
private LocalDateTime createTime;
```



## 异常

提供Excel导入异常 `ExcelImportException` 导入时遇到逻辑问题可抛出此异常。

``` java
public class ExcelImportException extends BaseException {

    public ExcelImportException(String message) {
        super(ResultCodeEnum.EXCEL_IMPORT_ERROR, JsonUtils.toJson(Collections.singletonList(message)));
    }

    public ExcelImportException(List<String> errMessages) {
        super(ResultCodeEnum.EXCEL_IMPORT_ERROR, JsonUtils.toJson(errMessages));
    }
}
```



## 合并单元格

一般合并单元格需要根据业务数据实现，无法做成通用注解。可参考 `UserMergeStrategy` 进行开发。

使用时调用 `ExcelUtils.export()` 方法，第二个参数传入自定义合并策略。

``` java
public void exportExcel(@RequestBody SysUserDTO sysUserDTO) {
    List<SysUserVO> sysUserVOS = sysUserService.exportExcel(sysUserDTO);
    ExcelUtils.export(sysUserVOS, SysUserVO.class, new UserMergeStrategy(sysUserVOS.size()));
}
```
