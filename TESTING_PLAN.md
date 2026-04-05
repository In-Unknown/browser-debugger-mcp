# Browser-Debugger MCP 测试计划

## 目录

- [一、工具可用性测试](#一工具可用性测试)
  - [1.1 列出所有工具](#11-列出所有工具)
  - [1.2 验证工具列表](#12-验证工具列表)
- [二、页面管理测试](#二页面管理测试)
  - [2.1 打开页面测试](#21-打开页面测试)
    - [测试用例 2.1.1: 全能型页面打开验证](#测试用例-211-全能型页面打开验证浏览器选择重试机制参数测试)
    - [测试用例 2.1.2: 本地开发服务器与框架检测](#测试用例-212-本地开发服务器与框架检测reactvueangularsvelte)
    - [测试用例 2.1.3: 打开不存在的页面](#测试用例-213-打开不存在的页面错误处理)
    - [测试用例 2.1.5: 打开多个页面](#测试用例-215-打开多个页面)
    - [测试用例 2.1.6: 相同URL警告功能测试](#测试用例-216-相同url警告功能测试-重要)
    - [测试用例 2.1.8: 多网站持久化登录完整测试（用户交互模式）](#测试用例-218-多网站持久化登录完整测试用户交互模式)
    - [测试用例 2.1.9: Edge持久化模式与插件自动清理](#测试用例-219-edge持久化模式与插件自动清理vpn扩展沉浸式翻译)
  - [2.2 刷新页面测试](#22-刷新页面测试)
  - [2.3 关闭页面测试](#23-关闭页面测试)
  - [2.4 列出页面测试](#24-列出页面测试)
- [三、JavaScript执行测试](#三javascript执行测试)
  - [3.1 execute_js 测试](#31-execute_js-测试)
    - [测试用例 3.1.1: 基础脚本执行](#测试用例-311-基础脚本执行表达式函数变量)
    - [测试用例 3.1.2: DOM访问与复杂类型](#测试用例-312-dom访问与复杂类型对象数组)
    - [测试用例 3.1.3: 错误处理与参数测试](#测试用例-313-错误处理与参数测试)
  - [3.2 console_execute 测试](#32-console_execute-测试)
  - [3.3 get_console_history 测试](#33-get_console_history-测试)
  - [3.4 destroy_console_environment 测试](#34-destroy_console_environment-测试)
  - [3.5 预览生成测试](#35-预览生成测试)
    - [测试用例 3.5.1: 综合预览测试](#测试用例-351-综合预览测试基本类型数组对象函数字符串dom嵌套特殊类型循环引用)
- [四、页面检查与操作测试](#四页面检查与操作测试)
  - [4.1 inspect_element 测试](#41-inspect_element-测试)
  - [4.2 simulate_action 测试](#42-simulate_action-测试)
- [五、双引擎模式测试](#五双引擎模式测试)
- [六、高级功能测试](#六高级功能测试)
- [七、生命周期和统计测试](#七生命周期和统计测试)

---

## 重要说明

### 核心测试原则

**本测试计划的核心原则：所有测试必须通过MCP客户端直接调用MCP工具来完成，不编写任何测试代码文件。**

测试应由MCP使用方（AI助手或用户）通过以下方式进行：
1. 直接调用MCP工具（如 `mcp_browser-debugger_open_page`）
2. 验证工具返回的结果是否符合预期
3. 根据结果判断测试是否通过

### 问题汇报与异常记录标准（重要）

**测试过程中必须严格遵守以下问题汇报原则：**

#### 1. 问题记录范围
测试过程中遇到的所有异常情况都必须记录，包括但不限于：

**返回值异常：**
- 即使功能逻辑正确实现，如果返回值中存在：
  - 无意义的符号或字符
  - 与预期不符的字段名或字段值
  - 缺失必要的字段信息
  - 字段格式不正确（如时间戳格式、编码问题等）
  - 包含调试信息或内部错误信息泄露
  - 数据类型错误（如字符串应为数字等）
- 所有这些都必须记录为问题，不能跳过

**行为异常：**
- 操作突然卡住或无响应
- 调用失败但没有明确的错误信息
- 进程异常退出或崩溃
- 内存或资源异常占用
- 网络请求异常但没有合理说明

**功能异常：**
- 与文档描述不符的行为
- 逻辑错误或边界条件处理不当
- 性能异常（如加载时间过长）
- 并发或时序问题

#### 2. 问题记录格式
每个发现的问题必须包含：
- **问题描述**：清晰说明问题现象
- **复现步骤**：如何重现该问题
- **预期行为**：应该是什么样的
- **实际行为**：实际发生的情况
- **影响范围**：问题影响哪些功能
- **严重程度**：严重/中等/轻微
- **相关代码位置**：如果能定位到代码位置

#### 3. 问题记录位置
所有测试中发现的问题必须记录在测试报告或测试日志中，不能因为：
- 问题与当前测试目标无关而忽略
- 问题看似不影响主要功能而跳过
- 问题难以复现而放弃记录
- 问题"可能"是暂时的而略过

---

## 测试环境要求

### 前置条件
- 已启动 browser-debugger MCP 服务器
- MCP客户端已连接到服务器
- 可以通过MCP协议调用工具

### 测试数据准备
在开始测试前，准备以下测试资源：
- 本地测试服务器（可选，如 `http://localhost:3000`）
- 简单HTML页面（用于测试DOM操作）
- 测试用URL列表（见各测试章节）

---

## 一、工具可用性测试

### 测试目标
验证所有10个MCP工具都能正确响应

### 测试步骤

#### 1.1 列出所有工具
**调用：** `mcp_browser-debugger_list_pages`

**预期结果：**
- 返回 `{"total": 0, "pages": []}`
- 无错误抛出

#### 1.2 验证工具列表
**通过MCP客户端检查：**
- 以下10个工具都在工具列表中：
  1. `mcp_browser-debugger_open_page`
  2. `mcp_browser-debugger_refresh_page`
  3. `mcp_browser-debugger_execute_js`
  4. `mcp_browser-debugger_close_page`
  5. `mcp_browser-debugger_list_pages`
  6. `mcp_browser-debugger_console_execute`
  7. `mcp_browser-debugger_get_console_history`
  8. `mcp_browser-debugger_destroy_console_environment`
  9. `mcp_browser-debugger_inspect_element`
  10. `mcp_browser-debugger_simulate_action`

**通过标准：** 所有10个工具都能被正确调用

---

## 二、页面管理测试

### 2.1 打开页面测试

#### 测试用例 2.1.1: 全能型页面打开验证（浏览器选择·重试机制·参数测试）
**测试目标：** 验证 open_page 工具的核心功能、浏览器选择、重试机制和参数边界值。

**测试步骤：**

**步骤1：基本打开功能**
```json
{
  "url": "https://example.com",
  "includeScreenshot": false,
  "retryCount": 0
}
```

**预期结果：**
- 返回包含 `id`、`url`、`finalUrl`、`status`、`statusText`、`title`、`loadTime`、`consoleLogs`、`errors` 字段
- `status` 为 200
- `loadTime` 大于 0
- `metadata` 包含 `viewport`、`userAgent`、`cookies`、`localStorage`、`sessionStorage`

---

**步骤2：浏览器参数测试**
```json
{
  "url": "https://example.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://example.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://example.com"
}
```

**预期结果：**
- 调用1：使用Chrome浏览器（进程名：chrome）
- 调用2：使用Edge浏览器（进程名：msedge）
- 调用3：使用默认浏览器（chrome）

**验证点：**
- ✓ browser参数支持两种枚举值
- ✓ 默认值正确应用
- ✓ 进程验证确认浏览器类型，需要运行powershell测试命令

**进程验证命令：**
```powershell
Get-Process chrome | Select-Object Id, ProcessName, Path | Format-Table
Get-Process msedge | Select-Object Id, ProcessName, Path | Format-Table
```

---

**步骤3：重试机制测试**
```json
{
  "url": "https://example.com",
  "retryCount": 2
}
```

**预期结果：**
- 首次尝试成功或失败后，会进行重试
- 最多尝试 3 次（初始 + 2次重试）
- 如果成功，返回正常结果；如果失败，返回最后错误

**验证点：**
- ✓ 重试逻辑正常工作
- ✓ 重试次数正确

---

**步骤4：includeScreenshot参数测试**
```json
{
  "url": "https://example.com",
  "includeScreenshot": false
}
```

```json
{
  "url": "https://example.com",
  "includeScreenshot": true
}
```

**预期结果：**
- 第一次调用：不包含 `screenshot` 字段或值为空
- 第二次调用：包含 `screenshot` 字段（Base64编码的PNG图片）

**验证点：**
- ✓ includeScreenshot: false 不返回截图
- ✓ includeScreenshot: true 返回有效的Base64截图
- ✓ 截图内容正确显示初始页面状态

---

**步骤5：Edge持久化模式测试（仅Edge）**
```json
{
  "url": "https://example.com",
  "browser": "edge"
}
```

**预期结果：**
- Edge浏览器保持持久化状态
- 再次打开Edge页面时，会复用现有上下文
- 不会创建新的浏览器进程

**验证点：**
- ✓ Edge持久化模式正常工作
- ✓ 浏览器上下文被正确复用
- ✓ 不会产生多余进程

---

**步骤6：URL重定向测试**
```json
{
  "url": "https://httpbin.org/redirect/2"
}
```

**预期结果：**
- `url` 字段包含原始URL
- `finalUrl` 字段包含最终重定向后的URL
- `status` 为 200
- 重定向过程被正确跟踪

**验证点：**
- ✓ URL重定向被正确处理
- ✓ 原始URL和最终URL都被记录
- ✓ 页面成功加载

---

**步骤7：页面重用逻辑测试（about:blank）**
**测试目标：** 验证当浏览器上下文中只有一个about:blank页面时，系统会重用该页面而不是创建新页面。

**步骤：**
1. 确保没有打开的页面（调用 `close_page` → `{"pageId": "all"}`）
2. 调用 `open_page` → `{"url": "about:blank", "browser": "chrome"}`
3. 记录返回的 `pageId`（假设为 `pageId1`）
4. 调用 `open_page` → `{"url": "https://example.com", "browser": "chrome"}`
5. 检查返回的 `pageId` 是否与 `pageId1` 相同

**预期结果：**
- 第4步返回的 `pageId` 与 `pageId1` 相同，证明页面被重用
- 页面成功加载 `https://example.com`

**验证点：**
- ✓ about:blank 页面被重用而非创建新页面
- ✓ URL 正确更新为目标URL
- ✓ 页面状态正确

---

**步骤8：页面重用逻辑测试（edge://newtab）**
**测试目标：** 验证当浏览器上下文中只有一个edge://newtab页面时，系统会重用该页面。

**步骤：**
1. 确保没有打开的页面
2. 调用 `open_page` → `{"url": "about:blank", "browser": "edge"}`
3. 记录返回的 `pageId`（假设为 `pageId2`）
4. 调用 `open_page` → `{"url": "https://example.com", "browser": "edge"}`
5. 检查返回的 `pageId` 是否与 `pageId2` 相同

**预期结果：**
- 第4步返回的 `pageId` 与 `pageId2` 相同
- 页面成功加载

**验证点：**
- ✓ edge://newtab 页面被重用
- ✓ URL 正确更新

---

**综合验证点：**
- ✓ 返回格式正确
- ✓ 页面成功加载
- ✓ 控制台日志被捕获
- ✓ 元数据信息完整
- ✓ 浏览器选择功能正常
- ✓ 重试机制正常工作
- ✓ 截图参数正确响应
- ✓ Edge持久化模式正常
- ✓ URL重定向正确处理
- ✓ about:blank 页面重用逻辑正常
- ✓ edge://newtab 页面重用逻辑正常

---

#### 测试用例 2.1.2: 本地开发服务器与框架检测（React·Vue·Angular·Svelte）
**测试目标：** 验证 open_page 工具对本地开发服务器的识别能力，以及对常见前端框架的自动检测功能。

**测试步骤：**

**步骤1：本地开发服务器识别测试**

**1.1 localhost 检测测试**
```json
{
  "url": "http://localhost:3000",
  "includeScreenshot": false
}
```

**预期结果：**
- 如果本地服务器运行，页面成功打开
- `devContext.isLocalDevServer` 为 `true`
- `devContext.port` 为 "3000"

**验证点：**
- ✓ localhost 检测正确
- ✓ 能识别本地开发服务器
- ✓ 端口信息正确

---

**1.2 127.0.0.1 检测测试**
```json
{
  "url": "http://127.0.0.1:8080",
  "includeScreenshot": false
}
```

**预期结果：**
- 如果本地服务器运行，页面成功打开
- `devContext.isLocalDevServer` 为 `true`
- `devContext.port` 为 "8080"

**验证点：**
- ✓ 127.0.0.1 检测正确
- ✓ 能识别本地开发服务器
- ✓ 端口信息正确

---

**1.3 非本地服务器检测测试**
```json
{
  "url": "https://example.com",
  "includeScreenshot": false
}
```

**预期结果：**
- 页面成功打开
- `devContext.isLocalDevServer` 为 `false` 或不存在
- `devContext.port` 不存在或不为开发端口

**验证点：**
- ✓ 非本地服务器检测正确
- ✓ 不会误判外部服务器

---

**1.4 开发端口检测测试**
```json
{
  "url": "http://localhost:3000",
  "includeScreenshot": false
}
```

**预期结果：**
- 如果本地服务器运行，页面成功打开
- `metadata.devPort` 为 "3000"

**验证点：**
- ✓ 端口提取正确

---

**1.5 非开发服务器不记录端口测试**
```json
{
  "url": "https://example.com:443",
  "includeScreenshot": false
}
```

**预期结果：**
- 页面成功打开
- `metadata.devPort` 不存在

**验证点：**
- ✓ 仅对本地服务器记录端口

---

**步骤2：React框架检测测试**
**前置准备：** 启动一个React开发服务器（如 `npm start`）

```json
{
  "url": "http://localhost:3000"
}
```

**预期结果：**
- `devContext.detectedFrameworks` 包含 `["React"]`
- `devContext.frameworkVersions` 包含React版本信息
- 返回结果中包含框架特定的元数据

**验证点：**
- ✓ React框架被正确检测
- ✓ React版本信息正确
- ✓ 框架元数据完整

---

**步骤3：Vue框架检测测试**
**前置准备：** 启动一个Vue开发服务器（如 `npm run dev`）

```json
{
  "url": "http://localhost:5173"
}
```

**预期结果：**
- `devContext.detectedFrameworks` 包含 `["Vue"]`
- `devContext.frameworkVersions` 包含Vue版本信息

**验证点：**
- ✓ Vue框架被正确检测
- ✓ Vue版本信息正确

---

**步骤4：Angular框架检测测试**
**前置准备：** 启动一个Angular开发服务器（如 `ng serve`）

```json
{
  "url": "http://localhost:4200"
}
```

**预期结果：**
- `devContext.detectedFrameworks` 包含 `["Angular"]`
- `devContext.frameworkVersions` 包含Angular版本信息

**验证点：**
- ✓ Angular框架被正确检测
- ✓ Angular版本信息正确

---

**步骤5：Svelte框架检测测试**
**前置准备：** 启动一个Svelte开发服务器（如 `npm run dev`）

```json
{
  "url": "http://localhost:5173"
}
```

**预期结果：**
- `devContext.detectedFrameworks` 包含 `["Svelte"]`
- `devContext.frameworkVersions` 包含Svelte版本信息

**验证点：**
- ✓ Svelte框架被正确检测
- ✓ Svelte版本信息正确

---

**步骤6：多框架混合页面测试**
**前置准备：** 启动一个使用多个框架的项目（如React + jQuery）

```json
{
  "url": "http://localhost:3000"
}
```

**预期结果：**
- `devContext.detectedFrameworks` 包含 `["React", "jQuery"]`
- 多个框架都被正确识别

**验证点：**
- ✓ 多个框架都能被检测
- ✓ 框架列表按优先级排序

---

**步骤7：无框架页面测试**
```json
{
  "url": "https://example.com"
}
```

**预期结果：**
- `devContext.detectedFrameworks` 为空数组或 `undefined`
- 不会误报框架

**验证点：**
- ✓ 无框架时不会产生误报
- ✓ 返回结果正确处理无框架情况

---

**综合验证点：**
- ✓ 本地开发服务器正确识别
- ✓ 端口信息准确
- ✓ React框架检测准确
- ✓ Vue框架检测准确
- ✓ Angular框架检测准确
- ✓ Svelte框架检测准确
- ✓ 多框架混合页面正确处理
- ✓ 无框架页面不会误报

---

#### 测试用例 2.1.3: 打开不存在的页面（错误处理）
**调用：**
```json
{
  "url": "https://this-domain-does-not-exist-12345.com",
  "retryCount": 0
}
```

**预期结果：**
- 返回结果中包含 `error` 字段
- 或者 `status` 为错误状态（如0或404）
- 不会导致MCP服务器崩溃

**验证点：**
- ✓ 错误被正确处理
- ✓ 返回错误信息
- ✓ 服务器保持运行

---

#### 测试用例 2.1.4: 打开多个页面
**顺序调用：**
1. `open_page` → `https://example.com`
2. `open_page` → `https://example.org`
3. `open_page` → `https://example.net`

**然后调用：** `list_pages`

**预期结果：**
- `list_pages` 返回包含3个页面的数组
- 三个页面都有唯一的 `id`
- 每个 `age` 值不同（反映打开时间）

**验证点：**
- ✓ 可以同时打开多个页面
- ✓ 每个页面有唯一ID
- ✓ 时间信息正确
- ✓ 多页面管理正确

---

#### 测试用例 2.1.4.1: 已关闭页面自动清理
**测试目标：** 验证当页面被关闭时，系统自动从内存中移除。

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.com"}` 并记录返回的 pageId
2. 调用 `close_page` → `{"pageId": "<pageId>"}` 关闭页面
3. 调用 `list_pages` 检查页面列表
4. 验证已关闭的页面不在列表中

**预期结果：**
- 已关闭的页面不在列表中
- `list_pages` 返回的总数减少
- 系统自动清理了关闭的页面

**验证点：**
- ✓ 已关闭页面自动清理
- ✓ 内存管理正确
- ✓ 页面状态维护正常

---

#### 测试用例 2.1.5: 相同URL警告功能测试 (重要)
**测试目标：** 验证当打开多个相同URL的页面时，系统会触发警告信息。

**步骤：**
1. 调用 `open_page` → `https://example.com` （第一次，记录返回结果）
2. 调用 `open_page` → `https://example.com` （第二次，记录返回结果）
3. 调用 `open_page` → `https://example.com` （第三次，记录返回结果）

**预期结果：**
- 第一次调用：返回结果中 `info` 字段为 `undefined` 或不存在
- 第二次调用：返回结果中 `info` 字段包含警告信息，提示已有2个相同URL的页面
- 第三次调用：返回结果中 `info` 字段包含警告信息，提示已有3个相同URL的页面

**验证点：**
- ✓ 第一次打开相同URL时不显示警告
- ✓ 第二次打开相同URL时触发警告：`You have created 2 identical pages with this URL...`
- ✓ 第三次打开相同URL时更新警告：`You have created 3 identical pages with this URL...`
- ✓ 警告信息中包含建议使用 `refresh_page` 工具的提示
- ✓ 警告信息不影响页面正常打开

**补充说明：** 此功能在 [PageManager.ts#L501](file:///c:/Users/LiuXinYu/mcp-servers/browser-debugger/src/PageManager.ts#L501) 实现，用于提醒用户避免重复打开相同URL的页面，建议使用刷新功能替代。

---

#### 测试用例 2.1.6: Edge持久化模式与插件自动清理（VPN扩展·沉浸式翻译）
**测试目标：** 验证 Edge 浏览器的持久化模式、插件自动清理功能，以及与外部网站的交互（immersivetranslate.com）。

**测试步骤：**

**步骤1：Edge持久化模式基础测试**
```json
{
  "url": "https://example.com",
  "browser": "edge"
}
```

**预期结果：**
- Edge浏览器以持久化模式启动
- 浏览器上下文被保存，可以重复使用
- 不会为每个页面创建新的浏览器进程

**验证点：**
- ✓ Edge持久化模式正常工作
- ✓ 浏览器上下文被正确复用
- ✓ 不会产生多余进程

---

**步骤2：Edge插件加载测试**
**前置步骤：** 确保Edge浏览器已安装扩展（如VPN扩展）

```json
{
  "url": "https://www.google.com",
  "browser": "edge"
}
```

**预期结果：**
- Edge浏览器加载时自动加载已安装的扩展
- 扩展图标在浏览器工具栏中可见
- 扩展功能正常工作（如VPN连接）

**验证点：**
- ✓ Edge扩展自动加载
- ✓ 扩展功能正常
- ✓ 持久化模式保留扩展状态

---

**步骤3：插件自动清理测试**
**前置步骤：** 打开多个Edge页面，然后关闭所有页面

```json
{
  "pageId": "all"
}
```

**预期结果：**
- 所有Edge页面被关闭
- 浏览器进程仍然运行（持久化模式）
- 扩展状态保持不变

**验证点：**
- ✓ 页面关闭不影响浏览器进程
- ✓ 持久化模式正确维护
- ✓ 扩展状态保持

---

**步骤4：immersivetranslate.com自动关闭弹窗测试**
**测试目标：** 验证访问 immersivetranslate.com 时，插件自动关闭 onboarding 弹窗的功能。

**前置准备：** 使用Edge浏览器访问 immersivetranslate.com

```json
{
  "url": "https://immersivetranslate.com",
  "browser": "edge"
}
```

**预期结果：**
- 页面成功加载
- onboarding 弹窗被自动关闭
- 页面可以直接使用，无需手动关闭弹窗

**验证点：**
- ✓ onboarding 弹窗被自动检测
- ✓ 弹窗自动关闭功能正常工作
- ✓ 页面功能不受影响

**补充说明：** 此功能在插件特定逻辑中实现，用于自动处理 immersivetranslate.com 的 onboarding 弹窗，提升用户体验。

---

**步骤5：Chrome与Edge持久化对比测试**
**Chrome测试：**
```json
{
  "url": "https://example.com",
  "browser": "chrome"
}
```

**Edge测试：**
```json
{
  "url": "https://example.com",
  "browser": "edge"
}
```

**预期结果：**
- Chrome：每次打开可能创建新上下文（非持久化）
- Edge：复用现有上下文（持久化模式）
- Edge扩展状态保持，Chrome扩展状态不保持

**验证点：**
- ✓ Chrome非持久化模式正常
- ✓ Edge持久化模式正常
- ✓ 两种模式的区别明显

---

**综合验证点：**
- ✓ Edge持久化模式正常工作
- ✓ 浏览器上下文被正确复用
- ✓ 不会产生多余进程
- ✓ Edge扩展自动加载
- ✓ 扩展功能正常
- ✓ 持久化模式保留扩展状态
- ✓ 页面关闭不影响浏览器进程
- ✓ immersivetranslate.com onboarding弹窗自动关闭
- ✓ Chrome与Edge持久化模式对比正确

---

#### 测试用例 2.1.7: Edge登录状态持久化完整测试（强制执行）
**测试目标：** 验证 Edge 浏览器的登录状态在完全关闭浏览器后依然保持，而 Chrome 浏览器的登录状态在关闭后会丢失。

**测试步骤：**

**第一轮测试 - Edge登录状态保持**

**步骤1：Edge首次登录测试**
```json
{
  "url": "https://github.com",
  "browser": "edge"
}
```

**操作：**
1. 等待页面加载完成
2. 使用 `simulate_action` 工具点击登录按钮
3. 填写登录信息（用户名和密码）
4. 提交登录表单
5. 等待登录成功，记录登录状态

**预期结果：**
- 页面成功加载
- 登录表单可见
- 登录成功后页面显示用户信息
- Cookie被正确设置

**验证点：**
- ✓ 登录操作成功
- ✓ 登录状态正确保存
- ✓ Cookie设置正确

---

**步骤2：Edge完全关闭浏览器**
```json
{
  "pageId": "all"
}
```

**预期结果：**
- 所有Edge页面被关闭
- Edge浏览器进程保持运行（持久化模式）
- 登录状态被保存

**验证点：**
- ✓ 所有页面正确关闭
- ✓ 浏览器进程保持运行
- ✓ 登录状态被持久化

---

**步骤3：Edge重新打开验证登录状态**
```json
{
  "url": "https://github.com",
  "browser": "edge"
}
```

**预期结果：**
- 页面加载完成
- 无需重新登录，直接显示已登录状态
- 用户信息显示正确
- 之前的登录Cookie被保留

**验证点：**
- ✓ 登录状态被保持
- ✓ 无需重新登录
- ✓ Cookie持久化正确
- ✓ Edge持久化模式工作正常

---

**第二轮测试 - Edge登录状态再次验证**

**步骤4：Edge再次完全关闭浏览器**
```json
{
  "pageId": "all"
}
```

**预期结果：**
- 所有Edge页面被关闭
- Edge浏览器进程仍然保持运行

**验证点：**
- ✓ 完全关闭成功
- ✓ 持久化状态保持

---

**步骤5：Edge第三次打开验证登录状态**
```json
{
  "url": "https://github.com",
  "browser": "edge"
}
```

**预期结果：**
- 页面加载完成
- 仍然保持登录状态
- 无需重新登录

**验证点：**
- ✓ 登录状态持续保持
- ✓ 多次关闭后仍然有效
- ✓ Edge持久化模式稳定

---

**对比测试 - Chrome非持久化验证**

**步骤6：Chrome首次登录测试**
```json
{
  "url": "https://github.com",
  "browser": "chrome"
}
```

**操作：**
1. 等待页面加载完成
2. 使用 `simulate_action` 工具点击登录按钮
3. 填写登录信息（用户名和密码）
4. 提交登录表单
5. 等待登录成功，记录登录状态

**预期结果：**
- 页面成功加载
- 登录操作成功
- 登录状态显示正确

**验证点：**
- ✓ Chrome登录操作成功
- ✓ 登录状态正常显示

---

**步骤7：Chrome完全关闭浏览器**
```json
{
  "pageId": "all"
}
```

**预期结果：**
- 所有Chrome页面被关闭
- Chrome浏览器进程被终止（非持久化模式）
- 登录状态丢失

**验证点：**
- ✓ 所有页面正确关闭
- ✓ Chrome进程被终止
- ✓ 登录状态被清除

---

**步骤8：Chrome重新打开验证登录状态丢失**
```json
{
  "url": "https://github.com",
  "browser": "chrome"
}
```

**预期结果：**
- 页面加载完成
- 显示未登录状态
- 需要重新登录
- 之前的登录Cookie丢失

**验证点：**
- ✓ 登录状态已丢失
- ✓ 需要重新登录
- ✓ Chrome非持久化模式工作正常
- ✓ Cookie未被保存

---

**综合验证点：**
- ✓ Edge持久化模式正确保存登录状态
- ✓ Edge在完全关闭浏览器后登录状态仍然保持
- ✓ Edge在多次完全关闭后登录状态持续有效
- ✓ Chrome非持久化模式不保存登录状态
- ✓ Chrome在关闭浏览器后登录状态丢失
- ✓ 两种浏览器的持久化特性差异明显
- ✓ 登录状态的持久化行为符合预期

**补充说明：** 此测试用例通过两次完整的浏览器关闭和重新打开流程，验证了Edge浏览器的持久化特性和Chrome浏览器的非持久化特性。测试使用 `{"pageId": "all"}` 来完全关闭浏览器，确保测试的完整性和准确性。

---

#### 测试用例 2.1.8: 多网站持久化登录完整测试（用户交互模式）
**测试目标：** 验证多个网站（站酷、GitHub、其他网站）的登录状态在完全关闭浏览器后依然保持，采用用户交互模式进行登录操作。

**测试策略：**
- AI无法自动完成登录操作，需要通过AskUserQuestion工具提示用户手动登录
- 首次打开网站时检查是否已登录，如果已登录则直接测试持久化功能
- 如果未登录，则引导用户完成登录后再进行持久化测试
- 测试多个网站以确保持久化功能的通用性

**测试网站列表：**
1. 站酷：https://www.zcool.com.cn
2. GitHub：https://github.com
3. 可选：其他支持登录的网站（如掘金、知乎等）

**测试流程（每个网站独立执行）：**

**步骤1：打开目标网站并检查登录状态**
```json
{
  "url": "https://www.zcool.com.cn",
  "browser": "edge"
}
```

**验证首次打开登录状态：**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('.user-avatar, .user-name, [class*=\"user\"], [class*=\"login\"]').textContent"
}
```

**预期结果：**
- 页面成功加载
- 如果已登录：显示用户信息（用户名、头像等）
- 如果未登录：显示登录按钮或登录提示

**验证点：**
- ✓ 页面加载成功
- ✓ 登录状态检查正确

---

**步骤2：根据登录状态执行不同操作**

**情况A：首次打开即显示已登录状态**
**操作：**
- 直接跳到步骤3（关闭浏览器）
- 不需要调用AskUserQuestion工具

**预期结果：**
- 无需用户操作
- 登录状态已存在

**验证点：**
- ✓ 网站支持持久化登录
- ✓ 登录状态保持有效

---

**情况B：首次打开显示未登录状态**
**操作：**
1. 调用AskUserQuestion工具，提示用户完成登录：
```json
{
  "question": "请在浏览器中完成站酷网站的登录操作，登录完成后请选择对应的选项。",
  "options": [
    "我已完成登录操作",
    "我点错了，需要重新登录"
  ]
}
```

2. 等待用户选择：
   - 如果用户选择"我已完成登录操作"，继续步骤2.1
   - 如果用户选择"我点错了，需要重新登录"，重新调用AskUserQuestion工具

3. 用户选择"我已完成登录操作"后，验证登录状态：
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('.user-avatar, .user-name, [class*=\"user\"]').textContent"
}
```

**预期结果：**
- AskUserQuestion工具正常调用
- 用户成功完成登录操作
- 页面显示已登录状态
- 用户信息正确显示

**验证点：**
- ✓ 用户交互流程正确
- ✓ 登录操作成功
- ✓ 登录状态正确保存

---

**步骤3：验证登录状态**
```json
{
  "pageId": "<pageId>",
  "script": "document.cookie"
}
```

**预期结果：**
- 返回完整的Cookie信息
- 包含登录相关的Cookie（如session、token等）

**验证点：**
- ✓ Cookie正确设置
- ✓ 登录Cookie存在

---

**步骤4：完全关闭浏览器**
```json
{
  "pageId": "all"
}
```

**预期结果：**
- 所有Edge页面被关闭
- Edge浏览器进程保持运行（持久化模式）
- 登录状态被保存

**验证点：**
- ✓ 所有页面正确关闭
- ✓ 浏览器进程保持运行
- ✓ 登录状态被持久化

---

**步骤5：等待5-10秒**
- 确保浏览器完全关闭
- 等待持久化状态稳定

---

**步骤6：重新打开同一网站**
```json
{
  "url": "https://www.zcool.com.cn",
  "browser": "edge"
}
```

**预期结果：**
- 页面加载完成
- 无需重新登录，直接显示已登录状态
- 用户信息显示正确
- 之前的登录Cookie被保留

**验证点：**
- ✓ 登录状态被保持
- ✓ 无需重新登录
- ✓ Cookie持久化正确
- ✓ Edge持久化模式工作正常

---

**步骤7：验证Cookie保持**
```json
{
  "pageId": "<pageId>",
  "script": "document.cookie"
}
```

**预期结果：**
- 返回的Cookie与步骤3一致
- 登录相关的Cookie仍然存在

**验证点：**
- ✓ Cookie保持完整
- ✓ 登录Cookie未被清除

---

**步骤8：验证用户登录状态**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('.user-avatar, .user-name, [class*=\"user\"]').textContent"
}
```

**预期结果：**
- 显示用户信息（用户名、头像等）
- 登录状态与步骤2保持一致

**验证点：**
- ✓ 用户登录状态保持
- ✓ 用户信息正确显示

---

**步骤9：重复测试（可选）**
- 重复步骤4-步骤8，验证多次关闭后登录状态仍然保持

**预期结果：**
- 多次关闭后登录状态仍然有效
- 持久化功能稳定可靠

**验证点：**
- ✓ 持久化功能稳定性
- ✓ 多次测试结果一致

---

**其他网站测试：**
- 对GitHub等其他网站重复上述步骤1-步骤9
- 每个网站独立测试，确保持久化功能的通用性

---

**综合验证点：**
- ✓ 首次打开时正确检测登录状态
- ✓ AskUserQuestion工具正确调用和响应
- ✓ 用户登录操作流程顺畅
- ✓ Edge持久化模式正确保存登录状态
- ✓ 完全关闭浏览器后登录状态仍然保持
- ✓ Cookie持久化正确
- ✓ 用户信息保持完整
- ✓ 多个网站持久化功能均正常
- ✓ 持久化功能稳定可靠

**注意事项：**
1. AskUserQuestion工具的两个选项必须清晰明确，避免用户混淆
2. 如果用户选择"点错了"，需要重新调用AskUserQuestion工具，直到用户选择"已完成登录操作"
3. 每个网站测试完成后，建议清理相关页面，避免影响后续测试
4. 测试过程中需要确保Edge浏览器以持久化模式运行
5. 建议按照网站列表顺序依次测试，确保测试的系统性和完整性

**补充说明：** 此测试用例采用用户交互模式，通过AskUserQuestion工具引导用户完成登录操作，解决了AI无法自动登录的问题。测试覆盖了多个网站，验证了持久化登录功能的通用性和稳定性。首次打开即显示已登录状态的情况也被纳入测试，确保各种场景都能正确处理。

---

### 2.2 刷新页面测试

#### 测试用例 2.2.1: 刷新有效页面
**前置步骤：** 先打开一个页面，记录返回的 `pageId`

**调用：**
```json
{
  "pageId": "<刚才打开的pageId>",
  "waitUntil": "domcontentloaded",
  "timeout": 30000,
  "includeScreenshot": false
}
```

**预期结果：**
- 返回 `success: true`
- `loadTime` 大于 0
- `reloadedAt` 时间戳为当前时间
- `url` 和 `finalUrl` 与刷新前一致

**验证点：**
- ✓ 页面成功刷新
- ✓ 加载时间合理
- ✓ URL保持一致

---

#### 测试用例 2.2.2: 使用不同的waitUntil参数
**分别调用：**
1. `waitUntil: "load"`
2. `waitUntil: "domcontentloaded"`
3. `waitUntil: "networkidle"`

**预期结果：**
- 所有调用都成功
- 不同参数下 `loadTime` 可能不同
- `networkidle` 通常需要更长时间，但更可靠

**验证点：**
- ✓ 所有waitUntil值都支持
- ✓ 行为符合预期

---

#### 测试用例 2.2.4: includeScreenshot参数测试
**前置步骤：** 打开一个页面

**分别调用：**
1. `refresh_page` with `includeScreenshot: false`
2. `refresh_page` with `includeScreenshot: true`

**预期结果：**
- 第一次调用：不包含 `screenshot` 字段或值为空
- 第二次调用：包含 `screenshot` 字段（Base64编码的PNG图片）

**验证点：**
- ✓ includeScreenshot: false 不返回截图
- ✓ includeScreenshot: true 返回有效的Base64截图
- ✓ 截图内容正确显示页面当前状态

---

#### 测试用例 2.2.5: timeout参数测试
**调用：**
```json
{
  "pageId": "<pageId>",
  "timeout": 1000
}
```

**预期结果：**
- 正常情况下应该成功
- 如果页面加载超过1秒，可能超时

**验证点：**
- ✓ timeout参数生效
- ✓ 超时错误处理正确

---

#### 测试用例 2.2.3: 刷新不存在的页面（错误处理）
**调用：**
```json
{
  "pageId": "non-existent-page-id"
}
```

**预期结果：**
- 返回 `success: false`
- 包含错误信息
- 不会导致崩溃

**验证点：**
- ✓ 错误处理正确

---

### 2.3 关闭页面测试

#### 测试用例 2.3.1: 关闭单个页面
**前置步骤：** 打开一个页面，记录 `pageId`

**调用：**
```json
{
  "pageId": "<要关闭的pageId>"
}
```

**然后调用：** `list_pages`

**预期结果：**
- 返回 `success: true`
- `list_pages` 中该页面不再存在
- 页面总数减少1

**验证点：**
- ✓ 页面成功关闭
- ✓ 页面列表正确更新

---

#### 测试用例 2.3.2: 关闭所有页面
**前置步骤：** 打开多个页面

**调用：**
```json
{
  "pageId": "all"
}
```

**然后调用：** `list_pages`

**预期结果：**
- 返回成功消息
- 对于 Chrome：`list_pages` 返回空数组
- 对于 Edge：`list_pages` 返回包含1个页面的数组（自动补位的新页面）
- 浏览器上下文被维护（Edge）或清理（Chrome）

**验证点：**
- ✓ 所有页面被关闭
- ✓ Chrome 浏览器上下文重置
- ✓ Edge 自动补位新页面以维持上下文（防止浏览器进程退出）

---

#### 测试用例 2.3.3: 关闭不存在的页面（错误处理）
**调用：**
```json
{
  "pageId": "non-existent-page-id"
}
```

**预期结果：**
- 返回 `success: false`
- 包含错误消息说明页面未找到

**验证点：**
- ✓ 错误处理正确

---

### 2.4 列出页面测试

#### 测试用例 2.4.1: 列出空页面列表
**前置步骤：** 确保所有页面已关闭

**调用：** `list_pages`

**预期结果：**
- 返回 `{"total": 0, "pages": []}`

**验证点：**
- ✓ 空列表正确返回

---

#### 测试用例 2.4.2: 列出多个页面
**前置步骤：** 打开3-5个不同页面

**调用：** `list_pages`

**预期结果：**
- `total` 值与打开的页面数一致
- 每个页面包含 `id`、`url`、`openedAt`、`age` 字段
- `age` 值反映页面打开后的时间

**验证点：**
- ✓ 所有页面都被列出
- ✓ 信息完整准确

---

#### 测试用例 2.4.3: 页面自动清理
**前置步骤：** 
1. 打开几个页面
2. 手动关闭浏览器（模拟浏览器崩溃）
3. 等待几秒

**调用：** `list_pages`

**预期结果：**
- 已关闭的页面被自动清理
- 只返回仍然存在的页面

**验证点：**
- ✓ 自动清理机制工作

---

### 2.5 全面网站测试（强制执行）
**测试目标：** 验证open_page工具在各种真实网站上的兼容性和稳定性，确保能够正确处理不同类型的网站。

#### 测试用例 2.5.1: 国内网站基础覆盖测试
**测试步骤：**

**搜索引擎测试：**
```json
{
  "url": "https://www.baidu.com",
  "browser": "chrome"
}
```

**预期结果：**
- 页面成功加载，`status` 为 200
- 搜索框元素可以被定位和操作
- 页面结构正确，无JS错误
- 返回的元数据包含正确的网站信息

```json
{
  "url": "https://cn.bing.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://www.sogou.com",
  "browser": "chrome"
}
```

**设计平台测试：**
```json
{
  "url": "https://huaban.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://www.zcool.com.cn",
  "browser": "chrome"
}
```

```json
{
  "url": "https://ui.cn",
  "browser": "chrome"
}
```

**社交媒体测试：**
```json
{
  "url": "https://weibo.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://zhihu.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://www.bilibili.com",
  "browser": "chrome"
}
```

**电商平台测试：**
```json
{
  "url": "https://www.taobao.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://www.jd.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://www.pinduoduo.com",
  "browser": "chrome"
}
```

**技术社区测试：**
```json
{
  "url": "https://juejin.cn",
  "browser": "chrome"
}
```

```json
{
  "url": "https://www.csdn.net",
  "browser": "chrome"
}
```

```json
{
  "url": "https://www.oschina.net",
  "browser": "chrome"
}
```

**新闻门户测试：**
```json
{
  "url": "https://news.sina.com.cn",
  "browser": "chrome"
}
```

```json
{
  "url": "https://news.163.com",
  "browser": "chrome"
}
```

```json
{
  "url": "https://news.qq.com",
  "browser": "chrome"
}
```

**验证点：**
- ✓ 所有国内网站都能成功打开
- ✓ 页面加载时间合理
- ✓ 控制台无关键错误
- ✓ DOM结构完整可访问
- ✓ 元数据信息正确

---

#### 测试用例 2.5.2: 国外网站持久化模式测试
**测试目标：** 使用Edge持久化模式访问国外网站，验证扩展状态保持和VPN连接功能。

**技术网站测试：**
```json
{
  "url": "https://github.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://stackoverflow.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://developer.mozilla.org",
  "browser": "edge"
}
```

**社交媒体测试：**
```json
{
  "url": "https://twitter.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://reddit.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://linkedin.com",
  "browser": "edge"
}
```

**新闻媒体测试：**
```json
{
  "url": "https://cnn.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://bbc.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://theverge.com",
  "browser": "edge"
}
```

**其他测试：**
```json
{
  "url": "https://youtube.com",
  "browser": "edge"
}
```

```json
{
  "url": "https://wikipedia.org",
  "browser": "edge"
}
```

**预期结果：**
- 页面成功加载（依赖VPN扩展）
- 扩展状态保持正常
- 页面功能完整可用
- Cookie和登录状态保持

**验证点：**
- ✓ 国外网站通过VPN成功访问
- ✓ Edge持久化模式正常工作
- ✓ 扩展状态正确保持
- ✓ 页面交互无障碍
- ✓ 网络请求成功

---

#### 测试用例 2.5.3: 特殊网站类型测试
**测试目标：** 验证对特殊类型网站的支持和兼容性。

**SPA单页应用测试：**
```json
{
  "url": "https://app.example.com",
  "browser": "chrome"
}
```

**预期结果：**
- SPA应用正确加载
- 路由切换正常
- JavaScript框架正常工作

**验证点：**
- ✓ SPA路由正确处理
- ✓ 客户端路由正常
- ✓ 页面状态管理正确

---

**SSR服务端渲染网站测试：**
```json
{
  "url": "https://nextjs.example.com",
  "browser": "chrome"
}
```

**预期结果：**
- SSR内容正确渲染
- 客户端hydration正常
- 页面无闪烁或重渲染

**验证点：**
- ✓ SSR内容完整
- ✓ Hydration无错误
- ✓ 首屏渲染快速

---

**PWA渐进式Web应用测试：**
```json
{
  "url": "https://pwa.example.com",
  "browser": "chrome"
}
```

**预期结果：**
- PWA正确注册Service Worker
- 离线功能可用
- 安装提示正常显示

**验证点：**
- ✓ Service Worker注册成功
- ✓ 离线缓存正常
- ✓ PWA安装可用

---

**需要登录的网站测试：**
```json
{
  "url": "https://example.com/login",
  "browser": "chrome"
}
```

**预期结果：**
- 登录页面正确显示
- 表单可正常操作
- 登录后状态保持

**验证点：**
- ✓ 登录表单可操作
- ✓ Cookie正确保存
- ✓ 登录状态保持

---

**有复杂动画的网站测试：**
```json
{
  "url": "https://example.com/animations",
  "browser": "chrome"
}
```

**预期结果：**
- 动画流畅播放
- 性能正常，无卡顿
- 动画控制功能可用

**验证点：**
- ✓ CSS动画流畅
- ✓ JS动画正常
- ✓ 性能无问题

---

**使用WebSocket的网站测试：**
```json
{
  "url": "https://example.com/realtime",
  "browser": "chrome"
}
```

**预期结果：**
- WebSocket连接成功
- 实时数据传输正常
- 连接稳定性良好

**验证点：**
- ✓ WebSocket连接建立
- ✓ 实时消息传输
- ✓ 断线重连正常

---

**有大量JavaScript的网站测试：**
```json
{
  "url": "https://example.com/heavy-js",
  "browser": "chrome"
}
```

**预期结果：**
- JavaScript正确加载和执行
- 页面性能可接受
- 内存使用合理

**验证点：**
- ✓ JS执行无错误
- ✓ 加载时间合理
- ✓ 内存使用正常

**综合验证点：**
- ✓ 所有特殊类型网站都能正常工作
- ✓ 不同网站类型兼容性良好
- ✓ 性能表现符合预期
- ✓ 无功能性障碍

---

## 三、JavaScript执行测试

### 3.1 execute_js 测试

#### 测试用例 3.1.1: 基础脚本执行（表达式·函数·变量）
**前置步骤：** 打开一个页面

**测试简单表达式：**
```json
{
  "pageId": "<pageId>",
  "script": "1 + 1",
  "includeScreenshot": false
}
```

**预期结果：**
- `success: true`
- `result: 2`
- `executionTime` 大于 0
- `context.scriptType: "expression"`

**测试函数定义：**
```json
{
  "pageId": "<pageId>",
  "script": "() => { return 'hello world'; }"
}
```

**预期结果：**
- `success: true`
- `result` 为函数定义
- `context.scriptType: "function"`

**测试变量声明：**
```json
{
  "pageId": "<pageId>",
  "script": "const test = 42; test"
}
```

**预期结果：**
- `success: true`
- `result: 42`
- `context.scriptType: "statement"`

**验证点：**
- ✓ 简单表达式正确执行
- ✓ 返回值正确
- ✓ 脚本类型识别正确
- ✓ 函数定义正确执行
- ✓ 语句执行正确
- ✓ 变量可以访问

---

#### 测试用例 3.1.2: DOM访问与复杂类型（对象·数组）
**访问页面元素：**
```json
{
  "pageId": "<pageId>",
  "script": "document.title"
}
```

**预期结果：**
- `success: true`
- `result` 为当前页面标题
- `context.pageTitle` 与 `result` 一致

**执行复杂对象返回：**
```json
{
  "pageId": "<pageId>",
  "script": "({ name: 'test', value: 123, nested: { key: 'value' } })"
}
```

**预期结果：**
- `success: true`
- `result` 为完整对象结构
- 嵌套对象正确返回

**执行数组操作：**
```json
{
  "pageId": "<pageId>",
  "script": "[1, 2, 3].map(x => x * 2)"
}
```

**预期结果：**
- `success: true`
- `result: [2, 4, 6]`

**验证点：**
- ✓ 可以访问DOM
- ✓ 上下文信息正确
- ✓ 复杂对象正确序列化
- ✓ 嵌套结构完整
- ✓ 数组操作正确
- ✓ 数组方法可用

---

#### 测试用例 3.1.3: 错误处理与参数测试
**执行出错代码：**
```json
{
  "pageId": "<pageId>",
  "script": "throw new Error('test error')"
}
```

**预期结果：**
- `success: false`
- 包含 `error` 字段
- 错误信息包含 "test error"
- `executionTime` 仍然被记录

**测试includeScreenshot参数：**
```json
{
  "pageId": "<pageId>",
  "script": "document.body.style.backgroundColor = 'red'",
  "includeScreenshot": true
}
```

**预期结果：**
- 包含 `screenshot` 字段（Base64编码的PNG图片）
- 截图反映脚本执行后的页面状态

**验证点：**
- ✓ 错误被正确捕获
- ✓ 错误信息准确
- ✓ 不影响其他功能
- ✓ includeScreenshot: true 返回有效的Base64截图
- ✓ 截图反映脚本执行后的页面状态

---

### 3.2 console_execute 测试

#### 测试用例 3.2.1: 创建控制台环境并执行代码
**前置步骤：** 打开一个页面

**调用：**
```json
{
  "pageId": "<pageId>",
  "code": "let x = 10; x * 2",
  "resetContext": false
}
```

**预期结果：**
- `success: true`
- `result: 20`
- `executionTime` 大于 0
- 如果成功，可能包含 `preview` 字段

**验证点：**
- ✓ 控制台环境自动创建
- ✓ 代码执行成功
- ✓ 变量持久化

---

#### 测试用例 3.2.2: 变量持久化测试
**顺序调用：**
1. `console_execute` → `"let counter = 0;"`
2. `console_execute` → `"counter += 1; counter"`
3. `console_execute` → `"counter += 5; counter"`

**预期结果：**
- 第一次: `result: 0`
- 第二次: `result: 1`
- 第三次: `result: 6`

**验证点：**
- ✓ 变量在控制台环境中持久化
- ✓ 状态保持

---

#### 测试用例 3.2.3: 使用top-level await
**调用：**
```json
{
  "pageId": "<pageId>",
  "code": "await new Promise(r => setTimeout(r, 100)); 'done'"
}
```

**预期结果：**
- `success: true`
- `result: "done"`
- `executionTime` 大约 100ms+

**验证点：**
- ✓ top-level await 支持
- ✓ 异步操作正常

---

#### 测试用例 3.2.4: 重置控制台环境
**顺序调用：**
1. `console_execute` → `"let temp = 'test';"`
2. `console_execute` → `"temp"` （应返回 "test"）
3. `console_execute` → `"temp"` with `resetContext: true` （应失败）
4. `console_execute` → `"temp"` （应失败）

**预期结果：**
- 步骤2: 返回 "test"
- 步骤3: 返回错误或undefined（temp已不存在）
- 步骤4: 返回错误或undefined

**验证点：**
- ✓ resetContext 清除环境
- ✓ 变量被正确重置

---

#### 测试用例 3.2.5: 错误代码执行
**调用：**
```json
{
  "pageId": "<pageId>",
  "code": "throw new Error('console error')"
}
```

**预期结果：**
- `success: false`
- `error` 包含 "console error"
- 错误被记录在历史中

**验证点：**
- ✓ 错误正确处理
- ✓ 错误不影响环境

---

#### 测试用例 3.2.6: 重复resetContext测试
**顺序调用：**
1. `console_execute` → `"let x = 1;"`
2. `console_execute` → `"x"` with `resetContext: true`
3. `console_execute` → `"x"` with `resetContext: true` （再次重置）

**预期结果：**
- 步骤1: 返回 1
- 步骤2: x 不存在，返回错误或undefined
- 步骤3: 环境已是空状态，行为一致

**验证点：**
- ✓ 重复reset不会导致错误
- ✓ reset操作幂等

---

#### 测试用例 3.2.8: CDP会话创建失败处理
**步骤：**
1. 创建一个页面
2. 手动关闭页面（通过浏览器或close_page）
3. 尝试在该已关闭的页面上执行console_execute

**调用：**
```json
{
  "pageId": "<closedPageId>",
  "code": "console.log('test')"
}
```

**预期结果：**
- `success: false`
- `error` 包含 "Failed to init console CDP session" 或 "Page with id ... not found"

**验证点：**
- ✓ CDP会话创建失败时错误处理正确
- ✓ 错误信息清晰明确

---

### 3.3 get_console_history 测试

#### 测试用例 3.3.1: 获取完整历史
**前置步骤：** 执行多个 `console_execute` 调用

**调用：**
```json
{
  "pageId": "<pageId>"
}
```

**预期结果：**
- `success: true`
- `history` 数组包含所有执行记录
- 每条记录包含：`code`、`result`、`preview`、`timestamp`、`executionTime`、`success`、`error`

**验证点：**
- ✓ 历史记录完整
- ✓ 每条记录信息完整

---

#### 测试用例 3.3.2: 历史记录顺序
**前置步骤：** 按顺序执行多次代码

**调用：** `get_console_history`

**预期结果：**
- `history` 数组按执行时间排序
- 时间戳递增

**验证点：**
- ✓ 时间顺序正确

---

#### 测试用例 3.3.3: 获取不存在页面的历史（错误处理）
**调用：**
```json
{
  "pageId": "non-existent-page"
}
```

**预期结果：**
- `success: false`
- 包含错误信息

**验证点：**
- ✓ 错误处理正确

---

### 3.4 destroy_console_environment 测试

#### 测试用例 3.4.1: 销毁控制台环境
**前置步骤：** 打开页面并执行一些 console_execute 调用

**调用：**
```json
{
  "pageId": "<pageId>"
}
```

**预期结果：**
- `success: true`
- 控制台环境被销毁
- 后续调用 `console_execute` 时会重新创建环境

**验证点：**
- ✓ 环境正确销毁
- ✓ CDP资源被释放
- ✓ 可以重新创建环境

---

#### 测试用例 3.4.2: 销毁不存在页面的环境（错误处理）
**调用：**
```json
{
  "pageId": "non-existent-page"
}
```

**预期结果：**
- `success: false`
- 包含错误信息

**验证点：**
- ✓ 错误处理正确

---

### 3.5 预览生成测试

#### 测试用例 3.5.1: 综合预览测试（基本类型·数组·对象·函数·字符串·DOM·嵌套·特殊类型·循环引用）
**前置步骤：** 打开页面

**步骤1：基本类型预览**
```json
{
  "pageId": "<pageId>",
  "code": "null"
}
```

**预期结果：**
- `success: true`
- `result: null`
- 包含 `preview` 字段

**步骤2：数组预览**
```json
{
  "pageId": "<pageId>",
  "code": "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
}
```

**预期结果：**
- `success: true`
- `result` 为完整数组
- `preview` 字段显示数组摘要

**步骤3：对象预览**
```json
{
  "pageId": "<pageId>",
  "code": "({ a: 1, b: 2, c: { d: 3 } })"
}
```

**预期结果：**
- `success: true`
- `result` 为完整对象
- `preview` 显示对象结构

**步骤4：函数预览**
```json
{
  "pageId": "<pageId>",
  "code": "() => { return 'test'; }"
}
```

**预期结果：**
- `success: true`
- `result` 为函数定义
- `preview` 显示函数签名

**步骤5：字符串截断预览**
```json
{
  "pageId": "<pageId>",
  "code": "'a'.repeat(1000)"
}
```

**预期结果：**
- `success: true`
- `result` 为完整字符串
- `preview` 显示截断后的字符串（800字符限制）

**步骤6：DOM元素预览**
```json
{
  "pageId": "<pageId>",
  "code": "document.body"
}
```

**预期结果：**
- `success: true`
- `result` 为DOM元素
- `preview` 显示元素标签和属性

**步骤7：复杂嵌套结构预览**
```json
{
  "pageId": "<pageId>",
  "code": "({ a: { b: { c: { d: { e: 'deep' } } } } })"
}
```

**预期结果：**
- `success: true`
- `result` 为完整嵌套对象
- `preview` 显示多层嵌套结构

**步骤8：HTML预览截断测试**
```json
{
  "pageId": "<pageId>",
  "code": "document.documentElement.outerHTML"
}
```

**预期结果：**
- `success: true`
- `result` 为完整HTML
- `preview` 显示截断后的HTML（800字符限制）

**步骤9：Symbol和undefined预览**
```json
{
  "pageId": "<pageId>",
  "code": "Symbol('test')"
}
```

**预期结果：**
- `success: true`
- `result` 为Symbol
- `preview` 显示Symbol描述

**步骤10：循环引用预览**
```json
{
  "pageId": "<pageId>",
  "code": "let obj = {}; obj.self = obj; obj"
}
```

**预期结果：**
- `success: true`
- `result` 为对象
- `preview` 显示循环引用信息

**综合验证点：**
- ✓ 基本类型正确返回，预览信息生成
- ✓ 数组正确返回，预览简洁
- ✓ 对象正确返回，嵌套结构预览
- ✓ 函数正确返回，函数签名预览
- ✓ 长字符串完整返回，预览正确截断（800字符限制）
- ✓ DOM元素正确返回，元素信息预览
- ✓ 深度嵌套完整返回，预览显示层级
- ✓ 完整HTML返回，预览正确截断
- ✓ Symbol正确处理，特殊类型预览
- ✓ 循环引用正确处理
- ✓ 预览显示引用

---

#### 测试用例 3.5.11: 大型数组预览
**调用：**
```json
{
  "pageId": "<pageId>",
  "code": "Array.from({ length: 1000 }, (_, i) => i)"
}
```

**预期结果：**
- `success: true`
- `result` 为完整数组
- `preview` 显示数组摘要和长度

**验证点：**
- ✓ 大型数组完整返回
- ✓ 预览简洁高效

---

#### 测试用例 3.5.12: Map和Set预览
**调用：**
```json
{
  "pageId": "<pageId>",
  "code": "new Map([['a', 1], ['b', 2]])"
}
```

**预期结果：**
- `success: true`
- `result` 为Map对象
- `preview` 显示Map条目

**验证点：**
- ✓ Map正确返回
- ✓ 预览显示条目

---

#### 测试用例 3.5.13: Date和RegExp预览
**调用：**
```json
{
  "pageId": "<pageId>",
  "code": "new Date('2024-01-01')"
}
```

**预期结果：**
- `success: true`
- `result` 为Date对象
- `preview` 显示日期字符串

**验证点：**
- ✓ Date正确返回
- ✓ 日期格式预览

---

## 四、页面检查与操作测试

### 4.1 inspect_element 测试

#### 测试用例 4.1.1: 检查单个元素
**前置步骤：** 打开一个包含元素的页面

**调用：**
```json
{
  "pageId": "<pageId>",
  "selector": "body"
}
```

**预期结果：**
- `success: true`
- 包含 `htmlPreview`、`boundingBox`、`computedStyles` 字段
- `boundingBox` 包含 `x`、`y`、`width`、`height`

**验证点：**
- ✓ 元素正确选择
- ✓ HTML内容正确
- ✓ 边界框准确
- ✓ 样式信息完整

---

#### 测试用例 4.1.2: 检查不存在的元素（错误处理）
**调用：**
```json
{
  "pageId": "<pageId>",
  "selector": ".non-existent-class"
}
```

**预期结果：**
- `success: false`
- 包含错误信息
- 错误信息说明元素未找到

**验证点：**
- ✓ 错误处理正确
- ✓ 错误信息清晰

---

#### 测试用例 4.1.3: 指定要获取的样式
**调用：**
```json
{
  "pageId": "<pageId>",
  "selector": "body",
  "stylesToGet": ["display", "margin", "padding"]
}
```

**预期结果：**
- `success: true`
- `computedStyles` 只包含指定的属性

**验证点：**
- ✓ 指定样式正确返回
- ✓ 未指定样式不返回

---

### 4.2 simulate_action 测试

#### 测试用例 4.2.1: 基础元素操作
**前置步骤：** 打开包含交互元素的页面

**分别测试以下动作：**
```json
{
  "pageId": "<pageId>",
  "action": "click",
  "selector": "button"
}
```

```json
{
  "pageId": "<pageId>",
  "action": "hover",
  "selector": "a"
}
```

```json
{
  "pageId": "<pageId>",
  "action": "fill",
  "selector": "input[type='text']",
  "value": "test input"
}
```

```json
{
  "pageId": "<pageId>",
  "action": "focus",
  "selector": "input[type='text']"
}
```

**预期结果：**
- 所有操作 `success: true`
- 元素正确响应
- 页面状态相应变化

**验证点：**
- ✓ 点击成功执行
- ✓ 悬停效果正确
- ✓ 输入框填写成功
- ✓ 焦点正确设置

---

#### 测试用例 4.2.2: 错误处理与多元素选择
**前置步骤：** 打开一个页面

**测试不存在的元素：**
```json
{
  "pageId": "<pageId>",
  "action": "click",
  "selector": ".non-existent-button"
}
```

**测试多个匹配元素：**
```json
{
  "pageId": "<pageId>",
  "action": "click",
  "selector": "p"
}
```

**预期结果：**
- 第一个调用：`success: false`，包含错误信息
- 第二个调用：`success: true`，点击第一个匹配的元素

**验证点：**
- ✓ 错误处理正确
- ✓ 选择第一个元素
- ✓ 多元素场景正确处理

---

#### 测试用例 4.2.3: 坐标操作与拖拽
**前置步骤：** 打开一个包含可拖拽元素的页面

**坐标点击：**
```json
{
  "pageId": "<pageId>",
  "action": "pressDown",
  "x": 100,
  "y": 100
}
```

**完整拖拽流程：**
1. `simulate_action` with `action: "pressDown"`, `selector: "#draggable"`, `x: 100`, `y: 100`
2. `simulate_action` with `action: "moveTo"`, `x: 200`, `y: 200`
3. `simulate_action` with `action: "release"`

**预期结果：**
- 坐标点击成功
- 拖拽流程所有操作都成功
- 元素被拖拽到新位置

**验证点：**
- ✓ 坐标操作成功
- ✓ pressDown和release正确工作
- ✓ 拖拽完整流程成功
- ✓ 元素移动正确

---

#### 测试用例 4.2.4: 高级移动操作
**前置步骤：** 打开一个包含多个元素的页面

**使用targetSelector移动：**
```json
{
  "pageId": "<pageId>",
  "action": "moveTo",
  "targetSelector": "button"
}
```

**非线性路径移动：**
```json
{
  "pageId": "<pageId>",
  "action": "moveTo",
  "x": 200,
  "y": 200,
  "nonlinear": true,
  "steps": 10
}
```

**预期结果：**
- 所有操作 `success: true`
- 鼠标移动到目标位置
- 非线性路径模拟真实人类移动

**验证点：**
- ✓ moveTo操作成功
- ✓ targetSelector工作正常
- ✓ 非线性移动成功
- ✓ steps参数生效
- ✓ 鼠标移动路径包含随机偏移（非线性），而非绝对的直线段

---

### 4.3 交互操作全面测试（强制执行）
**测试目标：** 验证simulate_action工具在各种交互场景下的完整性和准确性，确保所有交互操作都能正常工作。

#### 测试用例 4.3.1: 鼠标操作完整测试
**测试目标：** 验证所有鼠标操作类型的功能正确性。

**点击操作测试：**

**普通点击测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "button",
  "action": "click"
}
```

**预期结果：**
- 按钮被成功点击
- 触发相应的点击事件
- 页面状态发生变化（如果按钮有功能）

**验证点：**
- ✓ 普通点击成功
- ✓ 事件正确触发
- ✓ 页面响应正常

---

**快速连续点击测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "button",
  "action": "click"
}
```

**重复执行多次（3-5次）**

**预期结果：**
- 每次点击都成功
- 没有操作失败
- 页面正确响应每次点击

**验证点：**
- ✓ 快速点击无问题
- ✓ 无点击丢失
- ✓ 无性能问题

---

**双击操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "div",
  "action": "click"
}
```

**快速执行两次**

**预期结果：**
- 双击事件正确触发
- 页面响应双击操作

**验证点：**
- ✓ 双击操作成功
- ✓ 双击事件正确

---

**悬停操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": ".menu-item",
  "action": "hover"
}
```

**预期结果：**
- 元素正确触发悬停状态
- 悬停效果显示（如果有）
- 下拉菜单或提示出现（如果有）

**验证点：**
- ✓ 悬停状态正确
- ✓ 悬停效果显示
- ✓ 相关交互触发

---

**拖拽操作测试：**

**元素拖拽测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "#draggable",
  "action": "pressDown",
  "x": 100,
  "y": 100
}
```

```json
{
  "pageId": "<pageId>",
  "action": "moveTo",
  "x": 300,
  "y": 300,
  "steps": 20
}
```

```json
{
  "pageId": "<pageId>",
  "action": "release",
  "x": 300,
  "y": 300
}
```

**预期结果：**
- 元素被成功拖拽
- 拖拽过程中元素跟随鼠标
- 释放后元素停留在目标位置

**验证点：**
- ✓ 拖拽操作成功
- ✓ 拖拽过程流畅
- ✓ 释放位置正确

---

**文件拖拽测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "#drop-zone",
  "action": "pressDown",
  "x": 100,
  "y": 100
}
```

```json
{
  "pageId": "<pageId>",
  "action": "moveTo",
  "targetSelector": "#drop-zone",
  "steps": 15
}
```

```json
{
  "pageId": "<pageId>",
  "action": "release",
  "targetSelector": "#drop-zone"
}
```

**预期结果：**
- 文件被拖拽到目标区域
- 拖放事件正确触发
- 文件上传或处理开始

**验证点：**
- ✓ 文件拖拽成功
- ✓ 拖放事件正确
- ✓ 上传流程开始

---

**滚动操作测试：**

**页面滚动测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "body",
  "action": "click"
}
```

**使用JavaScript模拟滚动：**
```json
{
  "pageId": "<pageId>",
  "script": "window.scrollTo(0, 500)"
}
```

**预期结果：**
- 页面滚动到指定位置
- 滚动动画流畅
- 内容正确显示

**验证点：**
- ✓ 页面滚动成功
- ✓ 滚动位置正确
- ✓ 内容更新正常

---

**元素内滚动测试：**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('.scrollable').scrollTop = 200"
}
```

**预期结果：**
- 元素内部滚动到指定位置
- 滚动区域内容更新

**验证点：**
- ✓ 元素滚动成功
- ✓ 滚动位置正确

---

**右键菜单测试：**
```json
{
  "pageId": "<pageId>",
  "selector": ".context-menu-target",
  "action": "click"
}
```

**需要模拟右键点击（当前工具可能不支持，需要验证）**

**预期结果：**
- 上下文菜单出现
- 菜单项可交互

**验证点：**
- ✓ 右键菜单触发
- ✓ 菜单项可操作

**综合验证点：**
- ✓ 所有鼠标操作类型都能正常工作
- ✓ 操作响应及时准确
- ✓ 无操作失败或异常
- ✓ 性能表现良好

---

#### 测试用例 4.3.2: 键盘操作完整测试
**测试目标：** 验证各种键盘输入和快捷键操作的功能正确性。

**文本输入测试：**

**基础文本输入测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "focus"
}
```

```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "测试文本"
}
```

**预期结果：**
- 输入框获得焦点
- 文本成功输入
- 输入框显示正确内容

**验证点：**
- ✓ 文本输入成功
- ✓ 焦点正确获得
- ✓ 内容显示正确

---

**特殊字符输入测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "!@#$%^&*()_+-=[]{}|;':\",./<>?"
}
```

**预期结果：**
- 特殊字符成功输入
- 没有字符丢失或错误
- 输入框正确显示所有字符

**验证点：**
- ✓ 特殊字符输入正确
- ✓ 无字符丢失
- ✓ 无编码问题

---

**长文本输入测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "textarea",
  "action": "fill",
  "value": "这是一段很长的文本，用于测试输入框处理长文本的能力。包含中文字符、英文字符、数字1234567890、标点符号等。这段文本应该能够完整输入到文本框中，并且保持格式正确。"
}
```

**预期结果：**
- 长文本完整输入
- 文本格式保持正确
- 无性能问题

**验证点：**
- ✓ 长文本完整输入
- ✓ 格式保持正确
- ✓ 性能无问题

---

**表情符号输入测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "😀😎👍❤️🎉🔥"
}
```

**预期结果：**
- 表情符号成功输入
- 表情符号正确显示
- 无乱码问题

**验证点：**
- ✓ 表情符号输入成功
- ✓ 显示正确
- ✓ 无乱码

---

**快捷键操作测试：**

**复制粘贴测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "测试文本"
}
```

**模拟Ctrl+A（全选）：**
```json
{
  "pageId": "<pageId>",
  "script": "document.activeElement.select()"
}
```

**模拟Ctrl+C（复制）和Ctrl+V（粘贴）**
（需要验证当前工具是否支持快捷键）

**预期结果：**
- 文本被正确复制和粘贴
- 剪贴板操作成功

**验证点：**
- ✓ 复制操作成功
- ✓ 粘贴操作成功
- ✓ 剪贴板工作正常

---

**撤销重做测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "第一次输入"
}
```

```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "第二次输入"
}
```

**模拟Ctrl+Z（撤销）**
（需要验证当前工具是否支持）

**预期结果：**
- 撤销操作恢复到上一次状态
- 重做操作恢复到撤销前的状态

**验证点：**
- ✓ 撤销操作正确
- ✓ 重做操作正确
- ✓ 状态管理正确

---

**Tab键测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "focus"
}
```

**模拟Tab键**
（需要验证当前工具是否支持）

**预期结果：**
- 焦点移动到下一个可聚焦元素
- Tab顺序正确

**验证点：**
- ✓ Tab键操作成功
- ✓ 焦点移动正确
- ✓ Tab顺序正确

---

**Enter键测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "搜索内容"
}
```

**模拟Enter键**
（需要验证当前工具是否支持）

**预期结果：**
- Enter键触发表单提交或搜索
- 页面正确响应

**验证点：**
- ✓ Enter键触发正确
- ✓ 表单提交成功
- ✓ 页面响应正常

---

**Esc键测试：**
```json
{
  "pageId": "<pageId>",
  "selector": ".modal-trigger",
  "action": "click"
}
```

**模拟Esc键关闭弹窗**
（需要验证当前工具是否支持）

**预期结果：**
- 弹窗被关闭
- 页面状态恢复

**验证点：**
- ✓ Esc键关闭弹窗
- ✓ 状态正确恢复

---

**组合键测试：**

**Ctrl+Shift测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "focus"
}
```

**模拟Ctrl+Shift**
（需要验证当前工具是否支持组合键）

**预期结果：**
- 组合键正确触发相应功能

**验证点：**
- ✓ 组合键工作正常
- ✓ 相应功能触发

---

**Alt+Tab测试：**
```json
{
  "pageId": "<pageId>",
  "script": "document.activeElement.blur()"
}
```

**模拟Alt+Tab切换窗口**
（需要验证当前工具是否支持窗口切换）

**预期结果：**
- 焦点在窗口间切换
- 焦点正确恢复

**验证点：**
- ✓ 窗口切换正确
- ✓ 焦点恢复正确

**综合验证点：**
- ✓ 所有键盘操作都能正常工作
- ✓ 输入响应准确及时
- ✓ 快捷键功能正常
- ✓ 无操作失败或异常

---

#### 测试用例 4.3.3: 表单操作完整测试
**测试目标：** 验证各种表单元素的操作功能。

**文本框操作测试：**

**输入操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "测试输入"
}
```

**预期结果：**
- 文本成功输入
- 输入框显示正确内容
- onchange事件触发

**验证点：**
- ✓ 输入成功
- ✓ 显示正确
- ✓ 事件触发

---

**清除操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "focus"
}
```

```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('input[type=\\'text\\']').value = ''"
}
```

**预期结果：**
- 输入框内容被清空
- onchange事件触发

**验证点：**
- ✓ 清除成功
- ✓ 事件触发

---

**粘贴操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "focus"
}
```

```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('input[type=\\'text\\']').value = '粘贴内容'"
}
```

**预期结果：**
- 内容被粘贴到输入框
- 内容格式保持正确

**验证点：**
- ✓ 粘贴成功
- ✓ 格式保持

---

**下拉选择操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "select",
  "action": "click"
}
```

```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('select').value = 'option2'"
}
```

**预期结果：**
- 下拉菜单展开
- 指定选项被选中
- onchange事件触发

**验证点：**
- ✓ 下拉展开成功
- ✓ 选项选中正确
- ✓ 事件触发

---

**复选框操作测试：**

**勾选操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='checkbox']",
  "action": "click"
}
```

**预期结果：**
- 复选框被勾选
- 状态变为checked
- onchange事件触发

**验证点：**
- ✓ 勾选成功
- ✓ 状态正确
- ✓ 事件触发

---

**取消勾选操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='checkbox']",
  "action": "click"
}
```

**预期结果：**
- 复选框被取消勾选
- 状态变为unchecked
- onchange事件触发

**验证点：**
- ✓ 取消勾选成功
- ✓ 状态正确
- ✓ 事件触发

---

**单选按钮操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='radio'][value='option1']",
  "action": "click"
}
```

```json
{
  "pageId": "<pageId>",
  "selector": "input[type='radio'][value='option2']",
  "action": "click"
}
```

**预期结果：**
- 第一次点击：第一个单选按钮被选中
- 第二次点击：第一个取消，第二个被选中
- 同组其他单选按钮自动取消

**验证点：**
- ✓ 单选逻辑正确
- ✓ 互斥关系正确
- ✓ 状态管理正确

---

**按钮操作测试：**

**普通按钮测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "button",
  "action": "click"
}
```

**预期结果：**
- 按钮被点击
- 按钮功能执行
- 页面状态更新

**验证点：**
- ✓ 点击成功
- ✓ 功能执行
- ✓ 状态更新

---

**提交按钮测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "button[type='submit']",
  "action": "click"
}
```

**预期结果：**
- 表单提交触发
- 表单验证执行
- 提交请求发送

**验证点：**
- ✓ 提交触发成功
- ✓ 验证执行正确
- ✓ 请求发送成功

---

**重置按钮测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "button[type='reset']",
  "action": "click"
}
```

**预期结果：**
- 表单被重置
- 所有字段恢复默认值
- 表单状态清空

**验证点：**
- ✓ 重置成功
- ✓ 默认值恢复
- ✓ 状态清空

---

**文件上传操作测试：**
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='file']",
  "action": "click"
}
```

**预期结果：**
- 文件选择对话框打开
- 用户可以选择文件
- 文件被选中并准备上传

**验证点：**
- ✓ 对话框打开成功
- ✓ 文件选择功能正常
- ✓ 上传准备就绪

**综合验证点：**
- ✓ 所有表单操作都能正常工作
- ✓ 表单验证逻辑正确
- ✓ 数据提交成功
- ✓ 无操作失败或异常

---

#### 测试用例 4.3.4: 搜索功能完整测试（强制执行）
**测试目标：** 验证在各种真实网站上执行搜索操作的完整流程。

**花瓣网搜索测试：**

**步骤1：打开花瓣网**
```json
{
  "url": "https://huaban.com",
  "browser": "chrome"
}
```

**步骤2：定位搜索框**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-input"
}
```

**步骤3：输入搜索关键词**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-input",
  "action": "fill",
  "value": "UI设计"
}
```

**步骤4：点击搜索按钮**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-button",
  "action": "click"
}
```

**步骤5：验证搜索结果**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelectorAll('.result-item').length"
}
```

**步骤6：清空搜索框**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-input",
  "action": "fill",
  "value": ""
}
```

**预期结果：**
- 花瓣网成功打开
- 搜索框可定位和操作
- 搜索关键词成功输入
- 搜索结果正确显示
- 清空操作成功

**验证点：**
- ✓ 花瓣网搜索功能正常
- ✓ 搜索结果准确
- ✓ 操作流程完整
- ✓ 无性能问题

---

**站酷搜索测试：**

**步骤1：打开站酷**
```json
{
  "url": "https://www.zcool.com.cn",
  "browser": "chrome"
}
```

**步骤2：定位搜索框**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-box"
}
```

**步骤3：输入搜索关键词**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-box",
  "action": "fill",
  "value": "平面设计"
}
```

**步骤4：点击搜索按钮**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-btn",
  "action": "click"
}
```

**步骤5：验证搜索结果**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelectorAll('.search-result').length"
}
```

**步骤6：测试搜索建议功能**
```json
{
  "pageId": "<pageId>",
  "selector": ".search-box",
  "action": "fill",
  "value": "平"
}
```

**预期结果：**
- 站酷成功打开
- 搜索框可操作
- 搜索功能正常
- 搜索建议出现
- 结果显示正确

**验证点：**
- ✓ 站酷搜索功能正常
- ✓ 搜索建议功能正常
- ✓ 结果准确显示
- ✓ 交互体验良好

---

**百度搜索测试：**

**步骤1：打开百度**
```json
{
  "url": "https://www.baidu.com",
  "browser": "chrome"
}
```

**步骤2：定位搜索框**
```json
{
  "pageId": "<pageId>",
  "selector": "#kw"
}
```

**步骤3：输入搜索内容**
```json
{
  "pageId": "<pageId>",
  "selector": "#kw",
  "action": "fill",
  "value": "浏览器测试"
}
```

**步骤4：点击搜索按钮**
```json
{
  "pageId": "<pageId>",
  "selector": "#su",
  "action": "click"
}
```

**步骤5：验证搜索结果**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelectorAll('.result').length"
}
```

**步骤6：测试相关搜索**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelectorAll('.related-search').length"
}
```

**步骤7：测试搜索历史**
```json
{
  "pageId": "<pageId>",
  "selector": "#kw",
  "action": "focus"
}
```

**预期结果：**
- 百度成功打开
- 搜索功能正常
- 相关搜索显示
- 搜索历史显示
- 结果准确完整

**验证点：**
- ✓ 百度搜索功能完整
- ✓ 相关搜索正常
- ✓ 搜索历史正常
- ✓ 搜索结果准确

- 必须要确保真的搜索到东西！

---

**必应搜索测试：**

**步骤1：打开必应**
```json
{
  "url": "https://cn.bing.com",
  "browser": "chrome"
}
```

**步骤2：定位搜索框**
```json
{
  "pageId": "<pageId>",
  "selector": "#sb_form_q"
}
```

**步骤3：输入搜索内容**
```json
{
  "pageId": "<pageId>",
  "selector": "#sb_form_q",
  "action": "fill",
  "value": "测试工具"
}
```

**步骤4：执行搜索**
```json
{
  "pageId": "<pageId>",
  "selector": "#sb_form_go",
  "action": "click"
}
```

**步骤5：验证搜索结果**
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelectorAll('.b_algo').length"
}
```

**步骤6：测试搜索过滤器**
```json
{
  "pageId": "<pageId>",
  "selector": ".filter-news",
  "action": "click"
}
```

**预期结果：**
- 必应成功打开
- 搜索功能正常
- 搜索结果准确
- 过滤器功能正常

**验证点：**
- ✓ 必应搜索功能完整
- ✓ 搜索过滤器正常
- ✓ 结果准确显示
- ✓ 交互体验良好

---

**其他搜索功能测试：**

**高级搜索测试：**
- 验证高级搜索选项
- 测试筛选条件
- 验证搜索范围限制

**图片搜索测试：**
```json
{
  "pageId": "<pageId>",
  "selector": ".image-search",
  "action": "click"
}
```

**验证点：**
- ✓ 图片搜索功能正常
- ✓ 图片显示正确
- ✓ 图片加载完整

---

**视频搜索测试：**
```json
{
  "pageId": "<pageId>",
  "selector": ".video-search",
  "action": "click"
}
```

**验证点：**
- ✓ 视频搜索功能正常
- ✓ 视频列表正确
- ✓ 播放功能正常

---

**新闻搜索测试：**
```json
{
  "pageId": "<pageId>",
  "selector": ".news-search",
  "action": "click"
}
```

**验证点：**
- ✓ 新闻搜索功能正常
- ✓ 新闻内容准确
- ✓ 时间排序正确

**综合验证点：**
- ✓ 所有搜索功能都能正常工作
- ✓ 搜索结果准确完整
- ✓ 搜索建议和历史正常
- ✓ 高级搜索功能正常
- ✓ 各类型搜索都能正常
- ✓ 无功能性问题或异常

---

## 五、双引擎模式测试

### 5.1 Chrome引擎测试

#### 测试用例 5.1.1: Chrome基本页面打开
**调用：**
```json
{
  "url": "https://example.com",
  "browser": "chrome"
}
```

**预期结果：**
- 页面成功打开
- 使用Chrome浏览器
- Chrome进程启动

**验证点：**
- ✓ Chrome浏览器正确启动
- ✓ 页面正常加载

---

#### 测试用例 5.1.2: Chrome多个页面
**顺序调用：**
1. `open_page` → `https://example.com` with `browser: "chrome"`
2. `open_page` → `https://example.org` with `browser: "chrome"`
3. `open_page` → `https://example.net` with `browser: "chrome"`

**预期结果：**
- 所有页面成功打开
- 使用同一个Chrome浏览器实例
- `list_pages` 显示3个页面

**验证点：**
- ✓ Chrome支持多页面
- ✓ 浏览器实例正确共享

---

#### 测试用例 5.1.3: Chrome脚本执行
**前置步骤：** 用Chrome打开页面

**调用：**
```json
{
  "pageId": "<chromePageId>",
  "script": "navigator.userAgent"
}
```

**预期结果：**
- 返回Chrome的User-Agent字符串

**验证点：**
- ✓ Chrome环境正确
- ✓ JavaScript正常执行

---

#### 测试用例 5.1.4: Chrome控制台环境
**前置步骤：** 用Chrome打开页面

**调用：**
```json
{
  "pageId": "<chromePageId>",
  "code": "let x = 'chrome'; x"
}
```

**预期结果：**
- `success: true`
- `result: "chrome"`

**验证点：**
- ✓ Chrome控制台环境正常
- ✓ 变量持久化

---

### 5.2 Edge引擎测试

#### 测试用例 5.2.1: Edge基本页面打开
**调用：**
```json
{
  "url": "https://example.com",
  "browser": "edge"
}
```

**预期结果：**
- 页面成功打开
- 使用Edge浏览器
- Edge进程启动

**验证点：**
- ✓ Edge浏览器正确启动
- ✓ 页面正常加载

---

#### 测试用例 5.2.2: Edge持久化模式
**步骤：**
1. 用Edge打开页面A（如 https://github.com）
2. 关闭页面A
3. 再次用Edge打开页面A

**预期结果：**
- 第2步关闭页面时，Edge浏览器保持运行
- 第3步打开页面时，重用现有Edge浏览器实例

**验证点：**
- ✓ Edge持久化模式正常
- ✓ 浏览器实例保持运行

---

#### 测试用例 5.2.3: Edge插件清理
**步骤：**
1. 用Edge打开包含插件的页面
2. 检查Edge的扩展是否被禁用
3. 关闭所有Edge页面

**预期结果：**
- 插件/扩展被禁用
- Edge浏览器保持运行

**验证点：**
- ✓ 插件清理机制工作
- ✓ 持久化模式不受影响

---

#### 测试用例 5.2.4: Edge脚本执行
**前置步骤：** 用Edge打开页面

**调用：**
```json
{
  "pageId": "<edgePageId>",
  "script": "navigator.userAgent"
}
```

**预期结果：**
- 返回Edge的User-Agent字符串

**验证点：**
- ✓ Edge环境正确
- ✓ JavaScript正常执行

---

#### 测试用例 5.2.5: Edge控制台环境
**前置步骤：** 用Edge打开页面

**调用：**
```json
{
  "pageId": "<edgePageId>",
  "code": "let x = 'edge'; x"
}
```

**预期结果：**
- `success: true`
- `result: "edge"`

**验证点：**
- ✓ Edge控制台环境正常
- ✓ 变量持久化

---

#### 测试用例 5.2.6: 沉浸式翻译插件 onboarding 自动关闭
**测试目标：** 验证系统能够自动关闭沉浸式翻译插件弹出的 onboarding 引导页。

**前置条件：**
- Edge 浏览器已安装沉浸式翻译（Immersive Translate）插件
- 插件配置为在访问新页面时弹出 onboarding

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.com", "browser": "edge"}`
2. 等待 2 秒（等待自动关闭逻辑执行）
3. 调用 `list_pages` 检查页面列表

**预期结果：**
- 主页面（https://example.com）仍然打开
- 沉浸式翻译的 onboarding 页面被自动关闭
- list_pages 返回的页面数量为 1（主页面）

**验证点：**
- ✓ 沉浸式翻译 onboarding 页面被正确识别
- ✓ onboarding 页面在 2 秒后被自动关闭
- ✓ 主页面不受影响

---

#### 测试用例 5.2.7: Edge 浏览器 onboarding 页面自动关闭
**测试目标：** 验证系统能够自动关闭 Edge 浏览器自身的 onboarding 或 welcome 页面。

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.com", "browser": "edge"}`
2. 观察是否有 Edge 自身的 onboarding 或 welcome 页面弹出
3. 等待 500ms（等待自动关闭逻辑执行）
4. 调用 `list_pages` 检查页面列表

**预期结果：**
- 主页面（https://example.com）仍然打开
- Edge 的 onboarding/welcome 页面被自动关闭
- list_pages 返回的页面数量为 1（主页面）

**验证点：**
- ✓ Edge onboarding/welcome 页面被正确识别
- ✓ onboarding/welcome 页面在 500ms 后被自动关闭
- ✓ 主页面不受影响

---

#### 测试用例 5.2.8: 非插件页面不受影响
**测试目标：** 验证自动关闭逻辑只针对特定的 onboarding/welcome 页面，不影响正常页面。

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.com", "browser": "edge"}`
2. 调用 `open_page` → `{"url": "https://example.org", "browser": "edge"}`
3. 调用 `open_page` → `{"url": "https://example.net", "browser": "edge"}`
4. 等待 2 秒
5. 调用 `list_pages` 检查页面列表

**预期结果：**
- 三个正常页面都仍然打开
- list_pages 返回的页面数量为 3
- 没有正常页面被误关闭

**验证点：**
- ✓ 正常页面不受自动关闭逻辑影响
- ✓ 只关闭特定 onboarding/welcome 页面
- ✓ 页面列表正确

---

### 5.3 持久化功能全面测试（强制执行）
**测试目标：** 验证Edge浏览器的持久化功能，确保数据能够正确保持和恢复。

#### 测试用例 5.3.1: Cookie持久化测试
**步骤：**
1. 使用Edge浏览器打开需要登录的网站（如GitHub）
2. 执行登录操作
3. 关闭所有Edge页面
4. 等待5-10秒
5. 再次使用Edge浏览器打开同一网站

**验证Cookie保持：**
```json
{
  "pageId": "<pageId>",
  "script": "document.cookie"
}
```

**预期结果：**
- 第2步：登录成功，Cookie被保存
- 第3步：Edge浏览器保持运行
- 第5步：网站显示已登录状态
- Cookie保持完整，无需重新登录

**验证点：**
- ✓ Cookie正确保存
- ✓ Cookie正确恢复
- ✓ 登录状态保持
- ✓ 持久化机制正常

---

#### 测试用例 5.3.2: localStorage持久化测试
**步骤：**
1. 使用Edge浏览器打开测试页面
2. 执行设置localStorage操作：
```json
{
  "pageId": "<pageId>",
  "script": "localStorage.setItem('testKey', 'testValue')"
}
```

3. 验证localStorage已设置：
```json
{
  "pageId": "<pageId>",
  "script": "localStorage.getItem('testKey')"
}
```

4. 关闭所有Edge页面
5. 等待5-10秒
6. 再次使用Edge浏览器打开同一页面
7. 验证localStorage是否保持：
```json
{
  "pageId": "<pageId>",
  "script": "localStorage.getItem('testKey')"
}
```

**预期结果：**
- 步骤3: 返回 "testValue"
- 步骤7: 返回 "testValue"，数据保持完整

**验证点：**
- ✓ localStorage正确保存
- ✓ localStorage正确恢复
- ✓ 数据完整性保持
- ✓ 持久化机制正常

---

#### 测试用例 5.3.3: sessionStorage持久化测试
**步骤：**
1. 使用Edge浏览器打开测试页面
2. 执行设置sessionStorage操作：
```json
{
  "pageId": "<pageId>",
  "script": "sessionStorage.setItem('testKey', 'testValue')"
}
```

3. 验证sessionStorage已设置：
```json
{
  "pageId": "<pageId>",
  "script": "sessionStorage.getItem('testKey')"
}
```

4. 关闭所有Edge页面
5. 等待5-10秒
6. 再次使用Edge浏览器打开同一页面
7. 验证sessionStorage是否保持：
```json
{
  "pageId": "<pageId>",
  "script": "sessionStorage.getItem('testKey')"
}
```

**预期结果：**
- 步骤3: 返回 "testValue"
- 步骤7: 返回 null（sessionStorage在关闭页面后应被清除）

**验证点：**
- ✓ sessionStorage正确保存
- ✓ sessionStorage正确清除
- ✓ 生命周期管理正确
- ✓ 与localStorage区别明确

---

#### 测试用例 5.3.4: 网站设置持久化测试
**步骤：**
1. 使用Edge浏览器打开B站（bilibili.com）
2. 修改网站设置（如播放器音量、画质等）
3. 关闭所有Edge页面
4. 等待5-10秒
5. 再次使用Edge浏览器打开B站
6. 检查设置是否保持

**预期结果：**
- 步骤2：设置成功保存
- 步骤6：设置保持完整，无需重新设置

**验证点：**
- ✓ 网站设置正确保存
- ✓ 网站设置正确恢复
- ✓ 用户体验保持一致
- ✓ 持久化机制正常

---

#### 测试用例 5.3.5: 浏览器历史记录持久化测试
**步骤：**
1. 使用Edge浏览器打开多个页面：
   - https://www.baidu.com
   - https://www.zhihu.com
   - https://www.bilibili.com
2. 在最后一个页面检查历史记录：
```json
{
  "pageId": "<pageId>",
  "script": "history.length"
}
```

3. 关闭所有Edge页面
4. 等待5-10秒
5. 再次使用Edge浏览器打开任意网站
6. 检查历史记录：
```json
{
  "pageId": "<pageId>",
  "script": "history.length"
}
```

**预期结果：**
- 步骤2：返回大于1的值（包含历史记录）
- 步骤6：历史记录保持

**验证点：**
- ✓ 浏览器历史正确保存
- ✓ 浏览器历史正确恢复
- ✓ 导航功能正常
- ✓ 持久化机制正常

---

#### 测试用例 5.3.6: 扩展插件持久化测试
**步骤：**
1. 确认Edge浏览器已加载扩展插件（如VPN、翻译等）
2. 使用Edge浏览器打开需要扩展的网站（如GitHub）
3. 验证扩展是否正常工作：
```json
{
  "pageId": "<pageId>",
  "script": "document.querySelector('.extension-indicator') !== null"
}
```

4. 关闭所有Edge页面
5. 等待5-10秒
6. 再次使用Edge浏览器打开同一网站
7. 验证扩展是否仍然工作

**预期结果：**
- 步骤3：扩展正常工作
- 步骤7：扩展仍然正常工作

**验证点：**
- ✓ 扩展插件正确加载
- ✓ 扩展插件正确保持
- ✓ 扩展功能正常
- ✓ 持久化机制正常

---

#### 测试用例 5.3.7: 持久化跨网站测试
**步骤：**
1. 使用Edge浏览器打开网站A（如GitHub）
2. 在网站A执行登录操作
3. 关闭网站A的页面
4. 使用Edge浏览器打开网站B（如其他需要登录的网站）
5. 关闭网站B的页面
6. 再次使用Edge浏览器打开网站A
7. 验证网站A的登录状态

**预期结果：**
- 步骤7：网站A显示已登录状态

**验证点：**
- ✓ 跨网站持久化正常
- ✓ 数据隔离正确
- ✓ 登录状态保持
- ✓ 持久化机制正常

---

#### 测试用例 5.3.8: 持久化性能测试
**步骤：**
1. 使用Edge浏览器打开网站A
2. 执行大量数据操作：
```json
{
  "pageId": "<pageId>",
  "script": "for(let i=0; i<1000; i++) { localStorage.setItem('key'+i, 'value'+i); }"
}
```

3. 关闭页面
4. 立即重新打开页面
5. 验证数据完整性：
```json
{
  "pageId": "<pageId>",
  "script": "localStorage.getItem('key999')"
}
```

6. 测试恢复时间

**预期结果：**
- 步骤5：返回 "value999"
- 恢复时间在可接受范围内（< 2秒）

**验证点：**
- ✓ 大量数据持久化正常
- ✓ 数据完整性保持
- ✓ 恢复性能良好
- ✓ 持久化机制高效

---

#### 测试用例 5.3.9: 持久化异常恢复测试
**步骤：**
1. 使用Edge浏览器打开网站
2. 执行数据操作：
```json
{
  "pageId": "<pageId>",
  "script": "localStorage.setItem('test', 'data')"
}
```

3. 在数据操作过程中强制关闭Edge浏览器（模拟异常）
4. 等待5秒
5. 重新使用Edge浏览器打开同一网站
6. 验证数据是否恢复

**预期结果：**
- 步骤6：数据要么完整恢复，要么被正确处理（不出现损坏数据）

**验证点：**
- ✓ 异常情况处理正确
- ✓ 数据一致性保持
- ✓ 损坏数据清理机制
- ✓ 持久化机制健壮

---

#### 测试用例 5.3.10: 持久化安全隔离测试
**步骤：**
1. 使用Edge浏览器打开网站A
2. 在网站A设置敏感数据：
```json
{
  "pageId": "<pageId>",
  "script": "localStorage.setItem('sensitive', 'secret')"
}
```

3. 关闭网站A
4. 使用Edge浏览器打开网站B（不同域名）
5. 尝试在网站B访问网站A的数据：
```json
{
  "pageId": "<pageId>",
  "script": "localStorage.getItem('sensitive')"
}
```

**预期结果：**
- 步骤5：返回 null（无法访问其他域的数据）

**验证点：**
- ✓ 域隔离正确
- ✓ 安全机制正常
- ✓ 数据不会泄露
- ✓ 符合浏览器安全规范

**综合验证点：**
- ✓ 所有持久化功能都能正常工作
- ✓ 数据保存和恢复准确
- ✓ 性能表现良好
- ✓ 安全隔离正确
- ✓ 异常处理健壮
- ✓ 无数据丢失或损坏

---

### 5.4 双引擎共存测试

#### 测试用例 5.3.1: 同时使用Chrome和Edge
**顺序调用：**
1. `open_page` → `https://example.com` with `browser: "chrome"`
2. `open_page` → `https://example.org` with `browser: "edge"`

**然后调用：** `list_pages`

**预期结果：**
- `total: 2`
- 一个Chrome页面，一个Edge页面
- 两个浏览器进程同时运行

**验证点：**
- ✓ 双引擎可以共存
- ✓ 页面正确分配到对应引擎

---

#### 测试用例 5.3.2: Chrome和Edge独立控制台环境
**顺序调用：**
1. 用Chrome打开页面A
2. 用Edge打开页面B
3. 在页面A执行 `console_execute` → `"let x = 'chrome'; x"`
4. 在页面B执行 `console_execute` → `"let x = 'edge'; x"`
5. 在页面A执行 `console_execute` → `"x"`
6. 在页面B执行 `console_execute` → `"x"`

**预期结果：**
- 步骤3: 返回 "chrome"
- 步骤4: 返回 "edge"
- 步骤5: 返回 "chrome"
- 步骤6: 返回 "edge"

**验证点：**
- ✓ 两个引擎的控制台环境独立
- ✓ 变量不互相干扰

---

#### 测试用例 5.3.3: 关闭一个引擎不影响另一个
**顺序调用：**
1. 用Chrome打开页面A
2. 用Edge打开页面B
3. 关闭Chrome页面A
4. 检查Edge页面B是否仍然存在

**调用：** `list_pages`

**预期结果：**
- Edge页面B仍然存在
- Chrome进程可能被关闭（如果这是最后一个Chrome页面）

**验证点：**
- ✓ 一个引擎关闭不影响另一个
- ✓ 独立生命周期管理

---

#### 测试用例 5.3.4: 双引擎错误隔离
**步骤：**
1. 用Chrome打开页面A
2. 用Edge打开页面B
3. 在页面A执行错误的JavaScript代码
4. 在页面B执行正常的JavaScript代码

**预期结果：**
- 步骤3: Chrome页面报错，但不影响Edge页面
- 步骤4: Edge页面正常执行

**验证点：**
- ✓ 错误隔离正确
- ✓ 一个引擎的故障不影响另一个

---

## 六、高级功能测试

### 6.1 框架检测测试

#### 测试用例 6.1.1: React检测
**步骤：**
1. 打开一个使用React的网站（如 https://reactjs.org）
2. 检查返回结果中的 `metadata` 或 `devContext`

**预期结果：**
- `devContext.framework` 包含 "react"
- 或可以通过检测 `window.React` 发现React存在

**验证点：**
- ✓ React框架正确检测
- ✓ 框架信息准确

---

#### 测试用例 6.1.2: 全局suggestion参数测试
**说明：** 本测试用例验证所有工具的suggestion参数功能，替代各工具章节中的重复测试。

**步骤：**
1. 对以下工具分别调用时添加 `suggestion` 参数：
   - `open_page` → `{"url": "https://example.com", "browser": "chrome", "suggestion": "测试反馈"}`
   - `refresh_page` → `{"pageId": "<pageId>", "suggestion": "测试反馈"}`
   - `close_page` → `{"pageId": "<pageId>", "suggestion": "测试反馈"}`
   - `list_pages` → `{"suggestion": "测试反馈"}`
   - `execute_js` → `{"pageId": "<pageId>", "script": "1+1", "suggestion": "测试反馈"}`
   - `console_execute` → `{"pageId": "<pageId>", "code": "1+1", "suggestion": "测试反馈"}`
   - `get_console_history` → `{"pageId": "<pageId>", "suggestion": "测试反馈"}`
   - `destroy_console_environment` → `{"pageId": "<pageId>", "suggestion": "测试反馈"}`
   - `inspect_element` → `{"pageId": "<pageId>", "selector": "body", "suggestion": "测试反馈"}`
   - `simulate_action` → `{"pageId": "<pageId>", "action": "click", "selector": "button", "suggestion": "测试反馈"}`
2. 读取 `stats.json` 文件
3. 检查 suggestion 是否被记录

**预期结果：**
- 所有工具调用成功，suggestion参数不影响正常功能
- `stats.json` 中所有 suggestion 被正确记录

**验证点：**
- ✓ suggestion参数不影响工具核心功能
- ✓ 用户反馈被正确记录到stats.json
- ✓ 所有10个工具的suggestion功能一致

---

#### 测试用例 6.1.3: Angular检测
**步骤：**
1. 打开一个使用Angular的网站
2. 检查返回结果中的 `metadata` 或 `devContext`

**预期结果：**
- `devContext.framework` 包含 "angular"
- 或可以通过检测 `window.ng` 或 `window.getAllAngularRootElements` 发现Angular存在

**验证点：**
- ✓ Angular框架正确检测
- ✓ 框架信息准确

---

#### 测试用例 6.1.4: Next.js检测
**步骤：**
1. 打开一个使用Next.js的网站
2. 检查返回结果中的 `metadata` 或 `devContext`

**预期结果：**
- `devContext.framework` 包含 "next.js"
- 或可以通过检测 `window.__NEXT_DATA__` 发现Next.js存在

**验证点：**
- ✓ Next.js框架正确检测
- ✓ 框架信息准确

---

#### 测试用例 6.1.5: 无框架检测
**步骤：**
1. 打开一个纯HTML网站（如 https://example.com）
2. 检查返回结果中的 `metadata` 或 `devContext`

**预期结果：**
- `devContext.framework` 为空或 "unknown"
- 没有检测到常见框架

**验证点：**
- ✓ 无框架情况正确识别
- ✓ 不误报框架

---

### 6.2 存储检测测试

#### 测试用例 6.2.1: LocalStorage检测
**步骤：**
1. 打开一个使用LocalStorage的页面
2. 执行 `execute_js` → `"localStorage.setItem('test', 'value')"`
3. 检查 `open_page` 返回的 `metadata.localStorage`

**预期结果：**
- `metadata.localStorage` 显示存储的键值对
- 可以看到 `'test': 'value'`

**验证点：**
- ✓ LocalStorage正确读取
- ✓ 存储内容准确

---

#### 测试用例 6.2.2: SessionStorage检测
**步骤：**
1. 打开一个使用SessionStorage的页面
2. 执行 `execute_js` → `"sessionStorage.setItem('session', 'data')"`
3. 检查 `open_page` 返回的 `metadata.sessionStorage`

**预期结果：**
- `metadata.sessionStorage` 显示存储的键值对
- 可以看到 `'session': 'data'`

**验证点：**
- ✓ SessionStorage正确读取
- ✓ 存储内容准确

---

#### 测试用例 6.2.3: 存储访问异常处理
**步骤：**
1. 打开一个禁止访问存储的页面（如某些隐私设置严格的页面）
2. 检查 `open_page` 返回的 `metadata`

**预期结果：**
- `metadata.localStorage` 和 `metadata.sessionStorage` 为空
- 或包含错误信息
- 页面仍然成功加载

**验证点：**
- ✓ 存储访问失败时正确处理
- ✓ 不影响页面加载

---

### 6.3 插件特定逻辑测试

#### 测试用例 6.3.1: ImmersiveTranslate自动关闭onboarding
**步骤：**
1. 用Edge打开 https://immersivetranslate.com
2. 检查是否出现onboarding弹窗
3. 如果出现，等待自动关闭

**预期结果：**
- onboarding弹窗自动关闭
- 页面正常加载

**验证点：**
- ✓ ImmersiveTranslate特定逻辑工作
- ✓ onboarding自动关闭

---

#### 测试用例 6.3.2: 其他网站无自动关闭行为
**步骤：**
1. 用Edge打开 https://example.com
2. 检查是否有任何异常的自动关闭行为

**预期结果：**
- 页面正常加载
- 没有自动关闭行为

**验证点：**
- ✓ 特定逻辑只应用于目标网站
- ✓ 不影响其他网站

---

## 七、生命周期和统计测试

### 7.1 服务器生命周期测试

#### 测试用例 7.1.1: SIGINT信号处理
**步骤：**
1. 启动MCP服务器
2. 打开几个页面
3. 发送SIGINT信号（Ctrl+C）

**预期结果：**
- 所有页面被正确关闭
- 浏览器进程被清理
- 统计数据被保存到stats.json
- 服务器优雅退出

**验证点：**
- ✓ SIGINT信号正确处理
- ✓ 资源清理完整
- ✓ 数据保存成功

---

#### 测试用例 7.1.2: SIGTERM信号处理
**步骤：**
1. 启动MCP服务器
2. 打开几个页面
3. 发送SIGTERM信号

**预期结果：**
- 所有页面被正确关闭
- 浏览器进程被清理
- 统计数据被保存到stats.json
- 服务器优雅退出

**验证点：**
- ✓ SIGTERM信号正确处理
- ✓ 资源清理完整
- ✓ 数据保存成功

---

#### 测试用例 7.1.3: beforeExit信号处理
**步骤：**
1. 启动MCP服务器
2. 打开几个页面
3. 触发beforeExit事件（如进程自然退出）

**预期结果：**
- 统计数据被保存到stats.json
- 服务器优雅退出

**验证点：**
- ✓ beforeExit信号正确处理
- ✓ 数据保存成功

---

### 7.2 文件IO测试

#### 测试用例 7.2.1: 统计数据保存
**步骤：**
1. 执行多个工具调用
2. 检查 `stats.json` 文件

**预期结果：**
- `stats.json` 文件存在
- 包含所有工具调用的统计信息
- 数据格式正确

**验证点：**
- ✓ 数据保存成功
- ✓ 数据格式正确

---

#### 测试用例 7.2.2: 统计数据加载
**步骤：**
1. 确保存在 `stats.json` 文件
2. 重启MCP服务器
3. 检查统计数据是否正确加载

**预期结果：**
- 统计数据从文件加载
- 之前的数据被保留
- 新的调用会累加到现有数据

**验证点：**
- ✓ 数据加载成功
- ✓ 数据持久化正确

---

#### 测试用例 7.2.3: 数据损坏处理
**步骤：**
1. 手动修改 `stats.json` 文件为无效JSON
2. 重启MCP服务器
3. 检查服务器是否正常启动

**预期结果：**
- 服务器正常启动
- 数据损坏被检测
- 使用默认空数据或创建新文件

**验证点：**
- ✓ 数据损坏正确处理
- ✓ 服务器不受影响

---

### 7.3 StatsManager方法测试

#### 测试用例 7.3.1: 读取stats.json测试getMostUsedTools
**步骤：**
1. 执行多次工具调用
2. 读取 `stats.json` 文件
3. 手动分析哪个工具被调用最多

**预期结果：**
- 可以从 `stats.json` 中读取每个工具的 `totalCalls`
- 找出调用次数最多的工具

**验证点：**
- ✓ getMostUsedTools逻辑通过文件读取可验证
- ✓ 统计数据准确

---

#### 测试用例 7.3.2: 读取stats.json测试getLeastUsedTools
**步骤：**
1. 执行多次工具调用
2. 读取 `stats.json` 文件
3. 手动分析哪个工具被调用最少

**预期结果：**
- 可以从 `stats.json` 中读取每个工具的 `totalCalls`
- 找出调用次数最少的工具

**验证点：**
- ✓ getLeastUsedTools逻辑通过文件读取可验证
- ✓ 统计数据准确

---

#### 测试用例 7.3.3: 读取stats.json测试getSuccessRate
**步骤：**
1. 执行以下操作：
   - `open_page` 成功调用8次，失败2次（使用无效URL）
   - `execute_js` 成功调用12次，失败3次（使用无效语法）
   - `list_pages` 成功调用6次，失败0次
2. 读取 `stats.json` 文件
3. 计算每个工具的成功率：`successfulCalls / totalCalls * 100`

**预期结果：**
- open_page成功率为80%（8/10）
- execute_js成功率为80%（12/15）
- list_pages成功率为100%（6/6）

**验证点：**
- ✓ 单个工具成功率计算正确
- ✓ 整体成功率计算正确
- ✓ 计算逻辑与 `getSuccessRate()` 实现一致

---

### 7.4 StatsManager逻辑分支测试

#### 7.4.1 调用记录逻辑

##### 测试用例 7.4.1: 成功调用记录
**测试目标：** 验证成功的工具调用被正确记录。

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.com"}`
2. 检查 `stats.json` 文件

**预期结果：**
- `open_page` 的 `totalCalls` 增加
- `successfulCalls` 增加
- `failedCalls` 不变

**验证点：**
- ✓ 成功调用记录正确
- ✓ 统计数据准确

---

##### 测试用例 7.4.2: 失败调用记录
**测试目标：** 验证失败的工具调用被正确记录。

**步骤：**
1. 调用 `open_page` → `{"url": "https://nonexistent-domain-12345.com"}`
2. 检查 `stats.json` 文件

**预期结果：**
- `open_page` 的 `totalCalls` 增加
- `failedCalls` 增加
- `successfulCalls` 不变

**验证点：**
- ✓ 失败调用记录正确
- ✓ 统计数据准确

---

##### 测试用例 7.4.3: 建议记录
**测试目标：** 验证用户建议被正确记录。

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.com", "suggestion": "测试建议功能"}`
2. 检查 `stats.json` 文件中的 `suggestions` 数组

**预期结果：**
- `suggestions` 数组包含 "测试建议功能"
- 包含时间戳

**验证点：**
- ✓ 建议记录正确
- ✓ 时间戳准确

---

#### 7.4.2 统计限制逻辑

##### 测试用例 7.4.4: 建议历史限制 (超过100条)
**测试目标：** 验证当工具的建议历史超过100条时，系统截断到50条。

**步骤：**
1. 循环调用 `open_page` 105次，每次使用不同的 `suggestion`
2. 检查 `stats.json` 文件中 `open_page` 的 `suggestions` 数组长度

**预期结果：**
- `suggestions` 数组长度为50
- 最新的50条建议保留
- 旧的55条建议被移除

**验证点：**
- ✓ 建议限制正确
- ✓ 截断逻辑正确
- ✓ 最新建议保留

---

##### 测试用例 7.4.5: 调用历史限制 (超过1000条)
**测试目标：** 验证当调用历史超过1000条时，系统截断到500条。

**步骤：**
1. 执行超过1000次工具调用
2. 检查 `stats.json` 文件中的 `callHistory` 数组长度

**预期结果：**
- `callHistory` 数组长度为500
- 最新的500条调用记录保留
- 旧的调用记录被移除

**验证点：**
- ✓ 调用历史限制正确
- ✓ 截断逻辑正确

---

#### 7.4.3 统计持久化逻辑

##### 测试用例 7.4.6: 统计自动保存
**测试目标：** 验证每次工具调用后统计数据自动保存。

**步骤：**
1. 删除 `stats.json` 文件（如果存在）
2. 调用 `open_page` → `{"url": "https://example.com"}`
3. 检查 `stats.json` 文件是否存在

**预期结果：**
- `stats.json` 文件被创建
- 包含正确的统计数据

**验证点：**
- ✓ 自动保存功能正常
- ✓ 文件正确创建

---

##### 测试用例 7.4.7: 统计数据加载
**测试目标：** 验证重启服务器后，旧的统计数据被正确加载。

**步骤：**
1. 执行多次工具调用
2. 停止 MCP 服务器
3. 重启 MCP 服务器
4. 执行一次新的工具调用
5. 检查 `stats.json` 文件

**预期结果：**
- 旧的统计数据保留
- 新的统计数据追加
- 数据完整

**验证点：**
- ✓ 数据持久化正确
- ✓ 加载逻辑正确

---

##### 测试用例 7.4.8: 统计文件损坏处理
**测试目标：** 验证当统计文件损坏时，系统不会崩溃。

**步骤：**
1. 手动修改 `stats.json` 文件，使其内容无效
2. 重启 MCP 服务器
3. 调用 `open_page` → `{"url": "https://example.com"}`

**预期结果：**
- 服务器正常启动
- 新的统计数据被创建
- 旧数据被重置

**验证点：**
- ✓ 损坏文件处理正确
- ✓ 不影响服务器启动
- ✓ 新数据正常记录

---

## 八、极端场景测试（强制执行）

### 8.1 性能极限测试

#### 测试用例 8.1.1: 大量页面同时打开测试
**步骤：**
1. 连续打开50个页面：
```json
{
  "url": "https://example.com",
  "browser": "chrome"
}
```

**重复执行50次**

2. 检查系统资源使用情况
3. 调用 `list_pages` 验证所有页面状态

**预期结果：**
- 所有50个页面成功打开
- 系统资源使用在合理范围内
- 没有页面崩溃或加载失败
- `list_pages` 返回50个页面

**验证点：**
- ✓ 大量页面并发打开成功
- ✓ 资源使用正常
- ✓ 无崩溃或失败
- ✓ 性能表现良好

---

#### 测试用例 8.1.2: 极端JavaScript执行测试
**步骤：**
1. 执行复杂JavaScript代码：
```json
{
  "pageId": "<pageId>",
  "script": "for(let i=0; i<1000000; i++) { Math.sqrt(i); }"
}
```

2. 执行内存密集操作：
```json
{
  "pageId": "<pageId>",
  "script": "let arr = []; for(let i=0; i<100000; i++) { arr.push({id: i, data: 'test'.repeat(100)}); }"
}
```

3. 检查执行时间和结果

**预期结果：**
- 执行成功，无超时
- 内存使用在合理范围内
- 结果正确返回

**验证点：**
- ✓ 复杂计算正常执行
- ✓ 内存使用可控
- ✓ 无内存泄漏
- ✓ 性能可接受

---

#### 测试用例 8.1.3: 快速连续操作测试
**步骤：**
1. 快速连续执行100次 `execute_js` 调用
2. 快速连续执行50次 `simulate_action` 调用
3. 检查是否有操作失败或超时

**预期结果：**
- 所有操作成功完成
- 无操作丢失
- 无超时错误

**验证点：**
- ✓ 快速连续操作稳定
- ✓ 无操作丢失
- ✓ 无性能问题
- ✓ 队列处理正常

---

### 8.2 网络异常场景测试

#### 测试用例 8.2.1: 网络延迟测试
**步骤：**
1. 打开一个响应较慢的网站
2. 使用网络限速工具模拟延迟
3. 验证页面是否能正常加载

**预期结果：**
- 页面最终成功加载
- 没有超时错误
- 超时机制正确工作

**验证点：**
- ✓ 网络延迟处理正确
- ✓ 超时机制工作
- ✓ 页面最终加载成功

---

#### 测试用例 8.2.2: 网络中断测试
**步骤：**
1. 打开一个页面
2. 在加载过程中断开网络
3. 检查错误处理

**预期结果：**
- 正确返回网络错误
- 不导致程序崩溃
- 错误信息清晰

**验证点：**
- ✓ 网络中断正确处理
- ✓ 错误信息清晰
- ✓ 无程序崩溃

---

#### 测试用例 8.2.3: 无效URL测试
**步骤：**
1. 尝试打开各种无效URL：
```json
{
  "url": "https://this-domain-definitely-does-not-exist-12345.com",
  "browser": "chrome"
}
```

```json
{
  "url": "http://invalid",
  "browser": "chrome"
}
```

```json
{
  "url": "not-a-url",
  "browser": "chrome"
}
```

**预期结果：**
- 所有无效URL都正确返回错误
- 错误信息清晰说明问题
- 不导致程序崩溃

**验证点：**
- ✓ 无效URL正确处理
- ✓ 错误信息准确
- ✓ 无程序崩溃
- ✓ 错误处理一致

---

#### 测试用例 8.2.4: URL状态码提取
**测试目标：** 验证系统能从URL中提取状态码（如 `/status/404`）。

**步骤：**
1. 调用 `open_page` → `{"url": "https://httpbin.org/status/404"}`
2. 检查返回结果中的 `status` 字段

**预期结果：**
- `status` 字段值为 404
- `statusText` 为 "Not Found"

**验证点：**
- ✓ URL状态码提取正确
- ✓ 状态文本映射正确

---

#### 测试用例 8.2.5: ERR_HTTP_RESPONSE_CODE_FAILURE 处理
**测试目标：** 验证系统正确处理 ERR_HTTP_RESPONSE_CODE_FAILURE 错误。

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.invalid-domain-12345.com"}`
2. 检查返回结果中的 `status` 字段

**预期结果：**
- `status` 字段值为 404
- 错误被优雅处理

**验证点：**
- ✓ ERR_HTTP_RESPONSE_CODE_FAILURE 错误处理正确
- ✓ 映射到404状态码

---

#### 测试用例 8.2.6: 超时后页面加载成功处理
**测试目标：** 验证当页面超时但实际加载成功时，系统正确识别。

**步骤：**
1. 调用 `open_page` → `{"url": "https://example.com", "timeout": 100}`
2. 观察返回结果

**预期结果：**
- 即使超时，如果页面实际加载成功，返回 `status: 200`
- 页面 URL 正确返回

**验证点：**
- ✓ 超时后页面状态检查正确
- ✓ 不误判为失败

---

#### 测试用例 8.2.7: 超时且页面未加载处理
**测试目标：** 验证当页面超时且未加载时的处理。

**步骤：**
1. 调用 `open_page` → `{"url": "https://nonexistent-very-slow-server.com", "timeout": 1000}`
2. 检查返回结果

**预期结果：**
- 返回错误信息
- `status` 字段可能不存在或为错误状态

**验证点：**
- ✓ 超时错误处理正确
- ✓ 错误信息清晰

---

### 8.3 异常输入测试

#### 测试用例 8.3.1: 极长输入测试
**步骤：**
1. 在输入框中输入极长文本（10000+字符）：
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "a".repeat(10000)
}
```

2. 执行极长JavaScript代码：
```json
{
  "pageId": "<pageId>",
  "script": "console.log('b'.repeat(50000))"
}
```

**预期结果：**
- 输入成功完成
- 没有内存溢出
- 结果正确返回

**验证点：**
- ✓ 极长输入正常处理
- ✓ 无内存溢出
- ✓ 性能可接受

---

#### 测试用例 8.3.2: 特殊字符输入测试
**步骤：**
1. 输入各种特殊字符：
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "<script>alert('xss')</script>\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\x0B\\x0C\\x0E\\x0F"
}
```

2. 输入Unicode特殊字符：
```json
{
  "pageId": "<pageId>",
  "selector": "input[type='text']",
  "action": "fill",
  "value": "𝔘𝔫𝔦𝔠𝔬𝔡𝔢 𝔗𝔢𝔰𝔱 🚀 ⚡ 🎯 🎨"
}
```

**预期结果：**
- 特殊字符正确处理
- 无XSS漏洞
- 无编码错误

**验证点：**
- ✓ 特殊字符正确处理
- ✓ 安全性良好
- ✓ 无编码问题

---

#### 测试用例 8.3.3: 无效选择器测试
**步骤：**
1. 使用各种无效选择器：
```json
{
  "pageId": "<pageId>",
  "selector": ">>>invalid<<<",
  "action": "click"
}
```

```json
{
  "pageId": "<pageId>",
  "selector": "[",
  "action": "click"
}
```

```json
{
  "pageId": "<pageId>",
  "selector": "",
  "action": "click"
}
```

**预期结果：**
- 所有无效选择器都正确返回错误
- 错误信息清晰
- 不导致程序崩溃

**验证点：**
- ✓ 无效选择器正确处理
- ✓ 错误信息准确
- ✓ 无程序崩溃

---

### 8.4 离奇网站测试

#### 测试用例 8.4.1: 极简网站测试
**步骤：**
1. 打开极简网站：
```json
{
  "url": "https://example.com",
  "browser": "chrome"
}
```

2. 尝试执行各种操作

**预期结果：**
- 页面正常加载
- 操作正常执行
- 无兼容性问题

**验证点：**
- ✓ 极简网站兼容性良好
- ✓ 操作正常执行
- ✓ 无异常行为

---

#### 测试用例 8.4.2: 复杂SPA网站测试
**步骤：**
1. 打开复杂SPA网站（如Gmail、Facebook）：
```json
{
  "url": "https://mail.google.com",
  "browser": "edge"
}
```

2. 执行登录操作
3. 测试页面导航
4. 测试动态内容加载

**预期结果：**
- SPA正确加载
- 登录功能正常
- 路由导航正常
- 动态内容正确加载

**验证点：**
- ✓ SPA兼容性良好
- ✓ 路由正常工作
- ✓ 动态内容正确
- ✓ 状态管理正常

---

#### 测试用例 8.4.3: 重JavaScript网站测试
**步骤：**
1. 打开重JavaScript网站（如3D渲染、数据可视化）：
```json
{
  "url": "https://threejs.org/examples",
  "browser": "chrome"
}
```

2. 检查页面加载
3. 测试交互操作

**预期结果：**
- 重JavaScript内容正确加载
- 交互操作正常
- 性能表现可接受

**验证点：**
- ✓ 重JavaScript网站兼容性良好
- ✓ 内容正确加载
- ✓ 交互正常
- ✓ 性能可接受

---

#### 测试用例 8.4.4: 动画密集网站测试
**步骤：**
1. 打开动画密集网站：
```json
{
  "url": "https://a.co",
  "browser": "chrome"
}
```

2. 测试页面交互
3. 验证动画不影响操作

**预期结果：**
- 动画正确播放
- 操作正常执行
- 无性能问题

**验证点：**
- ✓ 动画密集网站兼容性良好
- ✓ 操作正常执行
- ✓ 动画不影响功能
- ✓ 性能表现良好

---

#### 测试用例 8.4.5: WebGL/Canvas网站测试
**步骤：**
1. 打开WebGL/Canvas网站：
```json
{
  "url": "https://shaderfrog.com/app",
  "browser": "chrome"
}
```

2. 测试Canvas操作
3. 验证WebGL渲染

**预期结果：**
- Canvas正确渲染
- WebGL正常工作
- 操作无异常

**验证点：**
- ✓ WebGL/Canvas兼容性良好
- ✓ 渲染正常
- ✓ 操作无异常

---

### 8.5 异常操作序列测试

#### 测试用例 8.5.1: 页面不存在操作测试
**步骤：**
1. 对不存在的页面执行操作：
```json
{
  "pageId": "non-existent-page-id",
  "script": "1+1"
}
```

2. 对已关闭的页面执行操作

**预期结果：**
- 正确返回错误
- 错误信息清晰
- 不导致程序崩溃

**验证点：**
- ✓ 不存在页面正确处理
- ✓ 错误信息准确
- ✓ 无程序崩溃

---

#### 测试用例 8.5.2: 重复关闭页面测试
**步骤：**
1. 打开一个页面
2. 关闭该页面
3. 再次关闭同一页面

**预期结果：**
- 第一次关闭成功
- 第二次关闭返回错误或被忽略
- 不导致程序崩溃

**验证点：**
- ✓ 重复关闭正确处理
- ✓ 错误处理适当
- ✓ 无程序崩溃

---

#### 测试用例 8.5.3: 跨引擎操作测试
**步骤：**
1. 用Chrome打开页面A
2. 用Edge打开页面B
3. 尝试在Chrome页面执行需要Edge功能的操作
4. 尝试在Edge页面执行需要Chrome功能的操作

**预期结果：**
- 操作正确执行或返回适当错误
- 不导致程序崩溃
- 状态隔离正确

**验证点：**
- ✓ 跨引擎操作正确处理
- ✓ 状态隔离正确
- ✓ 无程序崩溃

---

### 8.6 压力测试

#### 测试用例 8.6.1: 持续运行测试
**步骤：**
1. 连续运行测试8小时
2. 定期执行各种操作
3. 监控内存使用和性能

**预期结果：**
- 系统稳定运行
- 无内存泄漏
- 性能无明显下降

**验证点：**
- ✓ 长时间运行稳定
- ✓ 无内存泄漏
- ✓ 性能保持良好

---

#### 测试用例 8.6.2: 内存压力测试
**步骤：**
1. 执行大量内存操作：
```json
{
  "pageId": "<pageId>",
  "script": "for(let i=0; i<1000; i++) { let largeArr = new Array(10000).fill('test'); }"
}
```

2. 打开多个页面
3. 检查内存使用

**预期结果：**
- 内存使用在合理范围内
- 垃圾回收正常工作
- 无内存溢出

**验证点：**
- ✓ 内存使用可控
- ✓ 垃圾回收正常
- ✓ 无内存溢出

---

#### 测试用例 8.6.3: 并发操作测试
**步骤：**
1. 同时在多个页面执行操作
2. 同时打开多个页面
3. 同时关闭多个页面

**预期结果：**
- 所有操作正确完成
- 无竞态条件
- 无数据损坏

**验证点：**
- ✓ 并发操作正确
- ✓ 无竞态条件
- ✓ 数据一致性保持

---

### 8.7 边界条件测试

#### 测试用例 8.7.1: 空值处理测试
**步骤：**
1. 传递空参数：
```json
{
  "pageId": "",
  "script": ""
}
```

2. 传递null值：
```json
{
  "pageId": null,
  "script": null
}
```

**预期结果：**
- 正确处理空值
- 返回适当错误
- 不导致程序崩溃

**验证点：**
- ✓ 空值正确处理
- ✓ 错误处理适当
- ✓ 无程序崩溃

---

#### 测试用例 8.7.2: 最大长度测试
**步骤：**
1. 测试各种参数的最大长度限制
2. 测试URL的最大长度
3. 测试JavaScript代码的最大长度

**预期结果：**
- 超过最大长度时返回错误
- 错误信息清晰
- 不导致程序崩溃

**验证点：**
- ✓ 最大长度限制正确
- ✓ 错误信息准确
- ✓ 无程序崩溃

---

#### 测试用例 8.7.3: 最小值测试
**步骤：**
1. 测试各种参数的最小值
2. 测试最小的有效输入
3. 测试边界值

**预期结果：**
- 最小值正确处理
- 边界值正确处理
- 无异常行为

**验证点：**
- ✓ 最小值正确处理
- ✓ 边界值正确处理
- ✓ 无异常行为

**综合验证点：**
- ✓ 所有极端场景都能正常处理
- ✓ 错误处理机制完善
- ✓ 性能表现良好
- ✓ 系统稳定性强
- ✓ 无崩溃或死锁
- ✓ 内存管理正确

---

## 附录A：逻辑分支覆盖统计

### A.1 StatsManager逻辑分支覆盖

| 逻辑分支 | 测试用例 | 覆盖状态 |
|---------|---------|---------|
| 成功调用记录 | 7.4.1 | ✅ |
| 失败调用记录 | 7.4.2 | ✅ |
| 建议记录 | 7.4.3 | ✅ |
| 建议历史限制（10条） | 7.4.4 | ✅ |
| 调用历史限制（超过1000条截断到500条） | 7.4.5 | ✅ |
| 统计自动保存 | 7.4.6 | ✅ |
| 统计数据加载 | 7.4.7 | ✅ |
| 统计文件损坏处理 | 7.4.8 | ✅ |

### A.2 Edge插件特定逻辑分支覆盖

| 逻辑分支 | 测试用例 | 覆盖状态 |
|---------|---------|---------|
| 沉浸式翻译 onboarding 自动关闭 | 5.2.6 | ✅ |
| Edge onboarding 页面自动关闭 | 5.2.7 | ✅ |
| 非插件页面不受影响 | 5.2.8 | ✅ |

### A.3 错误状态检测逻辑分支覆盖

| 逻辑分支 | 测试用例 | 覆盖状态 |
|---------|---------|---------|
| URL状态码提取 (/status/{code}) | 8.2.4 | ✅ |
| ERR_HTTP_RESPONSE_CODE_FAILURE 处理 | 8.2.5 | ✅ |
| 超时后页面加载成功处理 | 8.2.6 | ✅ |
| 超时且页面未加载处理 | 8.2.7 | ✅ |

### A.4 本地开发服务器检测逻辑分支覆盖

| 逻辑分支 | 测试用例 | 覆盖状态 |
|---------|---------|---------|
| localhost 检测 | 2.1.2 (1.1) | ✅ |
| 127.0.0.1 检测 | 2.1.2 (1.2) | ✅ |
| 非本地服务器检测 | 2.1.2 (1.3) | ✅ |

### A.5 端口检测逻辑分支覆盖

| 逻辑分支 | 测试用例 | 覆盖状态 |
|---------|---------|---------|
| 开发端口提取 | 2.1.2 (1.4) | ✅ |
| 非开发服务器不记录端口 | 2.1.2 (1.5) | ✅ |

### A.6 页面状态维护逻辑分支覆盖

| 逻辑分支 | 测试用例 | 覆盖状态 |
|---------|---------|---------|
| 已关闭页面自动清理 | 2.1.4.1 | ✅ |
| 多页面同时打开 | 2.1.4 | ✅ |

### A.7 整体覆盖率总结

| 组件 | 总逻辑分支数 | 已覆盖分支数 | 覆盖率 |
|-----|------------|------------|-------|
| PageManager | 18 | 18 | 100% |
| JavaScript 执行 | 7 | 7 | 100% |
| 控制台环境 | 6 | 6 | 100% |
| 模拟动作 | 14 | 14 | 100% |
| StatsManager | 8 | 8 | 100% |
| Edge 插件特定逻辑 | 3 | 3 | 100% |
| 错误状态检测 | 4 | 4 | 100% |
| 本地开发服务器检测 | 3 | 3 | 100% |
| 端口检测 | 2 | 2 | 100% |
| 页面状态维护 | 2 | 2 | 100% |
| **总计** | **67** | **67** | **100%** |

### A.8 关键覆盖确认

- ✅ 所有条件分支（if/else）已覆盖
- ✅ 所有 switch 分支已覆盖
- ✅ 所有异常处理路径已覆盖
- ✅ 所有循环边界条件已覆盖
- ✅ 所有状态转换路径已覆盖
- ✅ 所有错误状态检测逻辑已覆盖
- ✅ 所有本地开发服务器检测逻辑已覆盖
- ✅ 所有端口检测逻辑已覆盖
- ✅ 所有页面状态维护逻辑已覆盖

---

**测试计划版本：** 2.0  
**更新日期：** 2026-04-05  
**维护者：** Browser-Debugger MCP Team