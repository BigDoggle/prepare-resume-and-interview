# 简历模板管理

## 目录

1. 模板定义
2. 注册表
3. 收录当前简历
4. 复制与修改
5. 版本和兼容性
6. 安全与隐私

## 一、模板定义

模板不是一张截图，也不是只包含 CSS 的片段。一个可用模板至少包含：

- 结构模板；
- 打印与屏幕样式；
- 示例/占位内容；
- 构建方式；
- PDF 导出方式或明确的浏览器打印路径；
- 需要的本地资产；
- `template.json` 元数据。

模板可以是固定两页等稳定结构，也可以是自动分页结构；元数据必须说明适用范围。

## 二、模板注册表

`assets/templates/registry.json` 是索引，模板目录中的 `template.json` 是单模板事实源。建议字段：

```json
{
  "id": "classic-blue-a4",
  "name": "经典蓝色双页 A4",
  "version": "1.0.0",
  "visibility": "public",
  "sourceType": "html",
  "description": "正式、单栏、适合技术岗位",
  "entry": "src/template.mjs",
  "style": "src/styles.css",
  "content": "content/resume.json",
  "features": ["a4", "pdf-export"],
  "createdAt": "YYYY-MM-DD",
  "updatedAt": "YYYY-MM-DD"
}
```

`visibility` 使用 `private` 或 `public`。Skill 自带的 `assets/templates/` 是可提交、可共享的模板库，只允许脱敏的 `public` 模板。`private` 只是元数据标记，不能阻止 Git 提交；含真实姓名、联系方式或照片的模板必须放在 Skill Git 仓库之外的用户指定模板根目录。

## 三、收录当前简历

1. 检查源目录，确认其为简历工程而非工作区根目录。
2. 确定模板 ID、名称、版本、来源、目标模板根目录和私有性；用户未指定私有模板目录时先询问，不擅自存入 Skill。
3. 使用 `template_manager.py register` 复制源码；默认排除构建产物、缓存、Git 和压缩包。
4. 对公共模板替换姓名、联系方式、照片、公司敏感信息和内网地址；私有模板可保留经用户授权的个人内容，但只能写入外部模板根目录。
5. 写入模板元数据并更新注册表。
6. 在模板目录运行构建和导出；不能只验证文件存在。

注册已存在的 ID 时默认失败。只有用户明确要求升级/替换，才使用 `--replace`；替换前检查工作树和目标目录。

Skill 内置注册表应设置 `"allowPrivate": false`。脚本向该目录注册 `private` 模板时必须在复制前拒绝，避免个人资料先落盘再报错。用户确需保留私有模板时，可创建外部注册表；未显式配置 `allowPrivate` 的外部模板库默认允许私有模板。

## 四、复制与修改

使用 `clone` 把模板复制到工作目录，再修改：

```bash
python3 scripts/template_manager.py --templates-root assets/templates \
  clone --id classic-blue-a4 --destination /absolute/path/to/new-resume
```

修改规则：

- 个人内容只写入工作副本；
- 通用版式改进可回写为模板新版本；
- 针对某个人的临时换行、照片偏移和专属字段不自动回写母版；
- 修改模板后更新 `version`、`updatedAt` 和兼容性说明；
- 重大信息架构变化升主版本，兼容功能增加升次版本，纯视觉修复升补丁版本。

## 五、版本和兼容性

模板升级时检查：

- 旧内容 JSON 是否仍能构建；
- 在线编辑字段 ID 是否稳定；
- 打印页数是否发生变化；
- 自定义照片、链接和中英文内容是否兼容；
- 导出脚本是否依赖特定机器的绝对路径；
- 是否新增远程依赖。

不要把模板注册表当作版本控制系统。需要历史时使用模板自身 Git 或明确保留版本目录，但不无休止复制 `final-v2-final`。

## 六、安全与隐私

- 不把私有模板上传、提交或分享给外部位置，除非用户明确授权；
- 不以 `visibility: private` 代替目录隔离和版本控制检查；
- 公共模板不得包含真实手机号、邮箱、照片、公司内网地址或客户数据；
- 注册脚本必须拒绝模板 ID 中的路径穿越；
- 删除或覆盖模板属于破坏性操作，必须确认明确目标；
- 模板中引用的字体、图标和图片要有合法使用边界。
