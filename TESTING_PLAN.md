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

**本测试计划的核心原则：所有测试必须通过MCP客户端直接调用MCP工具来完成，不编写任何测试代码文件。**

测试应由MCP使用方（AI助手或用户）通过以下方式进行：
1. 直接调用MCP工具（如 `mcp_browser-debugger_open_page`）
2. 验证工具返回的结果是否符合预期
3. 根据结果判断测试是否通过

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
- ✓ 能识别本地开发服务器
- ✓ 端口信息正确

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
- `list_pages` 返回 `total: 3`
- 三个页面都有唯一的 `id`
- 每个 `age` 值不同（反映打开时间）

**验证点：**
- ✓ 可以同时打开多个页面
- ✓ 每个页面有唯一ID
- ✓ 时间信息正确

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
- 对于 Chrome：`list_pages` 返回 `total: 0`
- 对于 Edge：`list_pages` 返回 `total: 1`（自动补位的新页面）
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
- 每条记录包含：`code`、`result`、`timestamp`、`executionTime`、`success`

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
- 包含 `html`、`boundingBox`、`styles` 字段
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
- `styles` 只包含指定的属性

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

### 5.3 双引擎共存测试

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