# Excel 导入导出<Badge type="warning" text="即将替换" />

::: warning 提示

由于 `myexcel` 许久未更新，当前正在寻找合适的开源项目进行替换

:::

Excel导入导出依赖于开源项目 `myexcel` [详细文档](https://github.com/liaochong/myexcel/wiki/%E9%A6%96%E9%A1%B5)

Excel 相关操作在`lihua-common/src/main/java/com/lihua/utils/excel/ExcelUtils.java` 中，可结合官方文档进行扩展

## Excel导出

使用`ExcelUtils.excelExport() `导出返回路径，返回到前端使用附件下载即可导出

``` java
// 数据库中查询出待导出集合
List<Test> testList = new ArrayList<>();
// 调用ExcelUtils导出。传入数据集合、对应实体类class、导出文件名称（未指定文件后缀会自动添加.xlsx）
// 返回导出文件路径，可通过该路径进行文件下载
String Path = ExcelUtils.excelExport(testList, Test.class, "导出文件名称");
```



## Excel 导入

传入`MultipartFile` 、对应实体类 class、根据多级表头配置 rowNum，即可返回解析到的数据

``` java
// controller 使用 MultipartFile 接收导入文件
MultipartFile file;
// 调用ExcelUtils导入，返回解析出的对应类型的集合。传入MultipartFile，对应实体类class，表格开始读取行数（0：第二行开始读取，1：第三行开始读取，根据是否多级表头进行配置）
List<Test> sysUserVOS = ExcelUtils.importExport(file, Test.class, 0);
```



## 常用注解

myexcel 导入导出依赖于对应实体类的相关注解，下面列出常用注解，更多用法请参阅[官方文档](https://github.com/liaochong/myexcel/wiki/Annotation)

- `@ExcelModel` 可指定sheet名称等信息，注解打在实体类上

- `@ExcelColumn`  描述导出的字段属性，注解打在属性上

- `@ExcelWriteConverterDictTypeCode` 这是利用自定义转化编写的自定义注解，作用是传入对应的字典类型，导出时会自动翻译为label（导入时请在程序中自行判断处理）。该注解需搭配`@ExcelColumn(writeConverter = SysDictWriteConverter.class)` 进行使用

  ``` java
  @EqualsAndHashCode(callSuper = true)
  @ExcelModel(sheetName = "岗位信息",includeAllField = false)
  @Data
  public class SysPostVO extends SysPost {
  
      // 所属部门名称
      @ExcelColumn(order = 2, index = 2, title = "*所属部门", width = 12)
      private String deptName;
  
      /**
       * excel 批量导入异常说明
       * 数据导入后，因异常无法入库的数据错误描述
       */
      @ExcelColumn(order = 9, title = "系统提示", style = {"cell->color:red"})
      private String importErrorMsg;
  }
  
  ```

  

  ``` java
  @EqualsAndHashCode(callSuper = true)
  @Data
  public class SysPost extends BaseEntity {
  
      /**
       * 主键
       */
      @TableId(type = IdType.ASSIGN_ID)
      private String id;
  
      /**
       * 部门主键
       */
      @NotNull(message = "请选择所属部门")
      private String deptId;
  
      /**
       * 部门编码
       */
      @NotNull(message = "请选择所属部门")
      private String deptCode;
  
      /**
       * 岗位名称
       */
      @ExcelColumn(index = 0, title = "*岗位名称", width = 12)
      @NotNull(message = "请输入岗位名称")
      private String name;
  
      /**
       * 岗位编码
       */
      @ExcelColumn(order = 1, index = 1, title = "*岗位编码", width = 12)
      @NotNull(message = "请输入岗位编码")
      private String code;
  
      /**
       * 岗位排序
       */
      @NotNull(message = "请输入岗位排序")
      private Integer sort;
  
      /**
       * 岗位状态
       */
      @ExcelColumn(order = 3, index = 3, title = "*状态", writeConverter = SysDictWriteConverter.class)
      @ExcelWriteConverterDictTypeCode("sys_status")
      @NotNull(message = "请选择状态")
      private String status;
  
      /**
       * 岗位负责人姓名
       */
      @ExcelColumn(order = 4, index = 4, title = "负责人")
      private String manager;
  
      /**
       * 岗位联系电话
       */
      @Pattern(regexp = "^1[3-9]\\d{9}$",
              message = "请输入正确的手机号码")
      @ExcelColumn(order = 5, index = 5, title = "联系电话", width = 6)
      private String phoneNumber;
  
      /**
       * 岗位邮件
       */
      @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
              message = "请输入正确的邮箱地址")
      @ExcelColumn(order = 6, index = 6, title = "邮箱", width = 6)
      private String email;
  
      /**
       * 岗位传真号码
       */
      @ExcelColumn(order = 7, index = 7, title = "传真", width = 6)
      private String fax;
  
      /**
       * 备注
       */
      @ExcelColumn(order = 8, index = 8, title = "备注", width = 6)
      private String remark;
  
      /**
       * 逻辑删除标志
       */
      private String delFlag;
  }
  ```



## 自定义数据转换

通过指定`@ExcelColumn` 中的 `writeConverter` 可实现自定义转化，可实现数据库保存编码，导出为名称的效果

1. 在 `lihua-common/src/main/java/com/lihua/utils/excel/annotation` 目录下新建自定义注解

     ``` java
     // 字典翻译的自定义转化注解
     @Retention(RetentionPolicy.RUNTIME)
     @Target({ElementType.FIELD})
     public @interface ExcelWriteConverterDictTypeCode {
         String value();
     }
     ```

2. 在 `lihua-common/src/main/java/com/lihua/utils/excel/converter` 目录下新建自定义转化实现

     需要实现 `CustomWriteConverter` 接口，通过 `customWriteContext.getField().getAnnotation()` 可获取到自定义注解及参数，可根据业务进行翻译等处理，最后将结果返回，返回的结果即为导出后显示的内容。

     ``` java
     // 字典翻译的自定义转化实现
     public class SysDictWriteConverter implements CustomWriteConverter<String, String> {
     
         @Override
         public String convert(String dictValue, CustomWriteContext customWriteContext) {
     
             // 获取自定义注解
             ExcelWriteConverterDictTypeCode annotation = customWriteContext.getField().getAnnotation(ExcelWriteConverterDictTypeCode.class);
     
             if (annotation == null) {
                 return null;
             }
     
             // 通过注解参数获取字典类型编码
             String dictTypeCode = annotation.value();
     
             // 通过字典类型编码和字典value获取label
             if (StringUtils.hasText(dictTypeCode)) {
                 String label = DictUtils.getLabel(dictTypeCode, dictValue);
     
                 if (StringUtils.hasText(label)) {
                     return label;
                 }
     
                 return dictValue;
             }
     
             return dictValue;
         }
     }
     ```

3. 使用自定义转化

     在 `@ExcelColumn` 注解上指定 `writeConverter` 为自定义转化实现，并打上自定义注解，传入指定参数即可。

     ``` java
     /**
      * 岗位状态
      */
     @ExcelColumn(order = 3, index = 3, title = "*状态", writeConverter = SysDictWriteConverter.class)
     @ExcelWriteConverterDictTypeCode("sys_status")
     @NotNull(message = "请选择状态")
     private String status;
     ```
