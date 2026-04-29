# VMS 混合主题 (Hybrid Theme) 终极维护手册

本手册是 VMS 系统样式的 **唯一权威参考**。它整合了设计规范、文件地图、变量索引及开发指南，旨在帮助团队在“混合模式”下保持视觉与代码的高度统一。

---

## 一、 设计哲学：Hybrid 混合架构
系统采用 **“常驻深色导航壳 + 动态响应内容区”** 的设计。
*   **导航外壳 (Sidebar/Topbar)**：锁定深色，象征稳定、专业的监控中枢。
*   **业务内容区 (Workspace)**：随主题切换，提供高清晰度的阅读体验。

---

## 二、 样式资产地图 (Style Asset Mapping)

| 资产类型 | 存放路径 | 核心职能 |
| :--- | :--- | :--- |
| **基础令牌 (Tokens)** | `src/styles/var.css` | **全局变量源**。定义全站色彩、背景、阴影、边框的原始 CSS 变量。 |
| **Sass 配置** | `src/styles/variables.scss`| **全局命名空间**。定义 `$namespace` (v) 和 `$elNamespace` (el)。 |
| **UI 引擎** | `src/styles/vms-ui.scss` | **框架重塑**。负责布局尺寸、导航锁定色、以及 Element Plus 组件皮肤。 |
| **业务组件** | `src/styles/vms.scss` | **自定义类**。定义业务特有的按钮（如 `.vms-main-button`）和公共类。 |
| **特区样式** | `TagsView.vue` (内联) | **局部锁定**。处理标签页椭圆形状及锁定深色。 |
| **总入口** | `src/styles/index.scss` | **优先级调度**。控制所有样式文件的引入顺序。 |

---

## 三、 核心变量与色彩系统 (Color & Tokens)

### 3.1 动态响应变量 (Workspace)
| 逻辑用途 | 变量名 | 日间模式 (Light) | 暗黑模式 (Dark) |
| :--- | :--- | :--- | :--- |
| **主背景** | `--vms-main-bg` | `#f0f2f5` (淡灰) | 深蓝渐变 (科技感) |
| **内容卡片** | `--vms-card-bg` | `#ffffff` (纯白) | `rgba(15, 23, 42, 0.4)` (透) |
| **正文文字** | `--vms-content-text` | `#1e293b` (深色) | `#cbd5e1` (亮银) |
| **边框线条** | `--vms-content-border`| `rgba(0,0,0,0.06)` | `rgba(56, 189, 248, 0.15)` |

### 3.2 锁定变量 (Fixed Shell)
**无论日间/暗黑，以下色值固定不变：**
| 区域 | 变量名 | 色值 | 用途 |
| :--- | :--- | :--- | :--- |
| **品牌主色** | `--vms-primary` | `#38bdf8` | 全局高亮、进度条、激活态 |
| **侧边栏背景** | `--vms-sidebar-bg`| `#020617` | 极客深蓝，保持导航稳重 |
| **顶栏背景** | `--vms-topbar-bg` | `#020617` | 统一顶部交互体验 |

---

## 四、 组件标准化规范

### 4.1 表格系统 (Table)
*   **表头**：日间模式强制设为纯白 (`#ffffff`)，暗黑模式使用 `var(--vms-card-bg)`。
*   **边框**：使用 `var(--vms-content-border)`，确保在不同底色下都能隐约可见。

### 4.2 输入与表单 (Input / Select)
*   **背景**：日间模式必须是纯白 (`#ffffff`)，暗黑模式跟随卡片透明色。
*   **圆角**：全站统一使用 `4px` 或 `6px`，严禁出现直角或过大圆角。

### 4.3 业务按钮 (Buttons)
*   **主按钮 (`.vms-main-button`)**：定义在 `vms.scss`。
*   **折叠按钮 (`.vms-ui-collapse-btn`)**：在 `vms-ui.scss` 中定义，悬停时仅发光，不产生位移。

---

## 五、 开发实战指南 (Dev Guide)

### 5.1 如何修改全局配色？
1.  打开 `src/styles/var.css`。
2.  在 `:root` 和 `.dark` 选择器下修改对应的 `--vms-` 变量。

### 5.2 如何添加一个新页面的样式？
1.  **推荐做法**：使用 `<style lang="scss" scoped>`。
2.  **变量优先**：使用 `var(--vms-card-bg)` 作为背景，`var(--vms-content-text)` 作为颜色。
3.  **穿透覆盖**：如果需要修改 Element Plus 内部样式，使用 `:deep()` 并确保你的改动在 `.dark` 作用域下有对应的逻辑。

---

## 六、 常见问题排查 (Troubleshooting)

1.  **样式不生效**：
    *   检查加载顺序：`vms-ui.scss` 的优先级极高，因为它在 `index.scss` 的最后引入。
    *   检查权重：我们的全局重塑使用了大量 `!important`，你的修改可能需要更高的选择器权重。
2.  **日间模式“显脏”**：
    *   原因：通常是 Element Plus 默认的灰白色背景没被洗掉。
    *   解决：在 `vms-ui.scss` 中对应的组件选择器下强制添加 `background-color: #fff !important`。
3.  **导航栏文字看不清**：
    *   原因：误用了动态文字变量。
    *   解决：导航栏区域应使用固定色值或专用的深色模式变量。

---
> [!IMPORTANT]
> **终极铁律**：主视图区（Workspace）必须是动态响应的；导航区（Sidebar/Topbar）必须是锁定深色的。
