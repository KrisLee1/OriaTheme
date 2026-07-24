# 官方预设主题目录

本文件是官方预设的名称、定位与设计灵感来源。预设只定义标准 Token Contract 中的视觉参数，不注入组件 CSS，也不改变页面结构或交互语义。

## 目录规则

- 每款主题必须提供完整的 light/dark token 集，使用稳定且唯一的 `oria-*` ID，并作为具名导出加入 `@oriatheme/presets`。
- 主题描述是设计方向，不是对第三方产品 token、素材、商标或界面的复制，也不表示与相关品牌存在合作或背书。
- 品牌与产品类只保留为灵感映射；公开主题必须使用完成命名复核的中性名称和 ID。若后续再调整公开名称，必须保留本文件中的灵感映射并记录兼容性影响。
- Bento、Dashboard、AI Native 等结构性语言只能通过 token 和官网预览模板表达氛围；runtime 不得因此创建侧边栏、卡片、悬浮按钮或对话组件。
- 每款主题都必须通过 schema 校验、light/dark 解析、唯一 ID、正文关键组合 WCAG AA 和安全 CSS 编译测试。

## 当前基线与数量说明

仓库可核实的既有预设为 4 款：Default、Ocean、Forest、Aurora。需求文字中的“已经有的 5 款”已确认是笔误；没有缺失主题。Aurora 直接复用既有 `oria-aurora`，不得创建重复 ID 或同名副本。

原 Phase 6 目录为 36 款：既有 4 款 + 新增 33 个方向 - 与既有 Aurora 重合 1 款。2026-07-18 先按新增需求加入 Line Art，再因 System Glass 与 Glass 定位重叠而移除前者；2026-07-21 根据用户提供的参考截图新增 Punchcard、Sketchbook、Soft Clay、Golden Bazaar 与 Theorem，当前目录为 41 款，所有条目均已实现。2026-07-21 Document Canvas 更名为 Manuscript，预览顺序调整为 Default 之后依次是 Manuscript 与 Mono～Memphis 视觉风格组，其余主题保持原相对顺序；同日经 ADR-0016 将稳定 ID 与具名导出同步为 `oria-manuscript` / `oriaManuscriptTheme`，token 数据不变。

## 2026-07-18 视觉重设计研究基线

本轮重设计先研究风格，再落到 token。研究只提取公开可观察的设计原则，不复制第三方私有 token、字体文件、素材或界面。主要依据包括：

- [Apple HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials)：玻璃是承载控件和导航的功能层，材质厚度表达层级，必须保持前景可读，且应克制使用。
- [Vercel Geist Colors](https://vercel.com/geist/colors) 与 [Typography](https://vercel.com/geist/typography)：背景、组件状态、边框和文字使用明确分级，高对比灰阶配合开发者排版。
- [Linear Brand Guidelines](https://linear.app/brand)：偏好留白、单色使用和低饱和蓝，明暗背景都应舒适。
- [Material Design 3 Elevation](https://m3.material.io/styles/elevation/overview) 与 [Color](https://m3.material.io/styles/color/overview)：表面色调、圆角和分级 elevation 共同表达组件层级。
- [Design Museum: Memphis Group](https://designmuseum.org/discover-design/all-stories/memphis-group-awful-or-awesome)：明亮大胆颜色、几何形状和强图案是 Memphis 的核心，不是普通粉彩圆角。
- [V&A: Arts and Crafts](https://www.vam.ac.uk/articles/arts-and-crafts-an-introduction) 与 [Cottagecore 色彩说明](https://www.vam.ac.uk/mused/fashion/dress-to-impress-the-fashion-cores-you-need-to-know/)：乡村传统、手工生产、自然材料，以及米色、苔绿、陶土色构成 Cottagecore / Organic 的基础。
- [Interaction Design Foundation: Typography](https://www.interaction-design.org/literature/article/the-ux-designer-s-guide-to-typography)、[Visual Hierarchy](https://www.interaction-design.org/literature/topics/visual-hierarchy) 与 [Glassmorphism](https://www.interaction-design.org/literature/topics/glassmorphism)：字体、字重、字距、留白共同形成编辑层级；玻璃依赖模糊、透明、薄边和阴影，但必须优先保证可访问性。
- [NASA Auroras](https://science.nasa.gov/sun/auroras/) 与 [NOAA Aurora Tutorial](https://www.spaceweather.gov/content/aurora-tutorial)：真实极光以绿色最常见，也包含蓝、紫、粉、红，因此 Aurora 不再是单一紫色渐变。
- [MoMA：Mechanical Reproduction from Premise to Press](https://post.moma.org/mechanical-reproduction-from-premise-to-press/) 将 line art 说明为完全由黑白构成、依靠高反差复制的图像；[Interaction Design Foundation：Visual Design](https://www.interaction-design.org/literature/topics/visual-design) 与 [Negative Space](https://www.interaction-design.org/literature/topics/negative-space) 则强调线是最基础的视觉元素，留白负责平衡、聚焦与可读性。Line Art 因此以纯黑白轮廓、负空间和无阴影平面为核心，而不是把 Mono 或 Minimalism 换一个名字。

每款主题的风格判定与 token 落点如下。此表是后续修改官方主题时的审查基线：

| 主题 | 风格特征 | Token 落点 |
|---|---|---|
| Default | 冷白轻盈、柔和悬浮、清晰亲和、适合作为现代产品基线 | 冷白灰表面、亮青蓝操作色、大圆角、单层半透明细边高光；图表以主青蓝起始，衔接清晰的 sky/teal/green/blue/indigo/red/orange 数据序列 |
| Ocean | 浅海清透、深海纵深、水面流动 | 青蓝语义色、冷色光泽、流动大圆角、径向深海暗色渐变 |
| Forest | 苔藓、蕨绿、树皮、林下暖光 | 苔绿与土色、衬线标题、有机分级圆角、泥土色软阴影 |
| Aurora | 绿色主光幕，蓝紫与红粉辅光，夜空纵深 | 四段极光渐变、弥散光晕、高饱和暗色材质、轻盈动效 |
| Warm Reading | 温暖纸白、炭褐正文、安静长读 | Charter 类阅读衬线、宽松行距、陶土强调色、低干扰阴影 |
| Monochrome Deploy | 黑白高对比、开发者工具、精细状态灰阶 | Geist 类排版、紧凑密度、小圆角、1px 边界、轻量阴影 |
| Precision Flow | 去饱和蓝紫、精密、高效、暗色优先 | 低饱和蓝、0.82 密度、小控件、小圆角、短时长动效 |
| Manuscript | 冷灰工作纸、石墨控制、内容优先 | 系统无衬线正文与等宽标题、直角纸页、高亮细描边、极轻薄层级与可选轻纸纹 |
| Elevated Surface | Tonal surface、分级 elevation、强调操作 | Material 式紫色系统、四级阴影、适中到大圆角、标准 easing |
| Bento UI | 模块化卡片、清楚分区、大块留白 | 大圆角、明显 raised surface、稳固卡片阴影、少量渐变焦点 |
| Dashboard | 数据密度、快速扫描、图表辨识 | 0.76 密度、小字号与控件、紧边界、8 个高辨识图表色 |
| Editorial | 杂志排版、超大标题、纸墨对比 | 4.5rem 衬线 display、紧标题字距、宽松正文、无阴影锐利分隔 |
| AI Native | 对话协作、生成状态、上下文层级 | 珍珠中性色、紫蓝到青绿生成光谱、柔和卡片、连贯动效 |
| Command Center | 键盘驱动、实时状态、控制台密度 | 全等宽字体、0.75 密度、近零圆角、青色信号、极短动效 |
| Spatial UI | 悬浮厚玻璃、景深、环境光 | 36px blur、深层多层阴影、超大圆角、冷暖空间渐变 |
| Mono | 严格无彩、比例与内容建立秩序 | 纯灰阶图表、平面层级、中性排版；不复用 Deploy 的开发者密度 |
| Minimalism | 留白、少装饰、单一焦点、功能优先 | 1.2 密度、无阴影、细边界、含反馈状态在内的柔和黑色与深灰单色系统 |
| Line Art | 纯黑白轮廓、负空间、纸面平整感、描边优先 | 黑白反转双模式、强轮廓边界、近直角、无阴影、无彩色图表与反馈状态 |
| Glass | 清透磨砂面板、立体边缘折射、柔和悬浮、冷色焦点 | 30px blur、六向边缘高光与内侧亮带、分级轻投影；图表以 cyan→teal→emerald→lime→amber→orange→pink→violet 的棱镜序列配合透明材质 |
| Neo Brutalism | 粗黑框、零圆角、硬偏移阴影、饱和原色 | 3px strong border、7px 无模糊阴影、机械 easing、粗重字重 |
| Punchcard | 暖纸统计板、时间/进度格、亲和的大号数字 | 黄主操作、粉/浅蓝辅助表面、圆润但克制的卡片、统一墨黑硬偏移阴影、宽字距数据标签，以及白色浮起表面的可选规则小圆点；不复用 Neo Brutalism 的零圆角蓝色操作，也不复用 Memphis 的多色阴影和几何装饰 |
| Sketchbook | 手绘作品集、点阵纸、墨线与便利贴拼贴 | 暖白纸面上的背景点阵与表面墨线网格、深墨主操作、手写字体栈、2px 墨线和轻纸张阴影；薄荷 secondary、柠檬 accent、粉/蓝图表色通过语义 token 表达，避免复制参考图的人像、文案、图标或布局 |
| Soft Clay | 复古奶油软陶、厚实圆润的白色开关与表单控制、静谧日程面板 | 奶油背景和暖灰文字、低饱和橙色状态点、三层定向高光/阴影、内凹细节与从控件到容器显著放大的圆角；不修改 Neumorphism 的既有蓝灰视觉系统 |
| Golden Bazaar | 日照橱窗、暖桃环境光、蜜糖黄操作与轻盈商品卡 | 桃杏至金黄的径向背景、奶油白浮起表面、明黄 primary、珊瑚 secondary、靛蓝 accent、超大圆角和暖色柔影；只提取图片的色彩、材质和层级原则，不复制品牌、商品、图标、文案或布局 |
| Theorem | 数学讲义、遮罩中的象牙白浮层、炭黑衬线与酒红批注 | 暖白纸面配炭黑 `scrim` 形成遮罩后的暖灰背景，背景以安全 Paper noise 颗粒还原纸面纤维；象牙白无圆角纸页、Palatino/Iowan 类衬线、炭黑 primary、酒红 accent、1px 细边；常规卡片无阴影，只有 `lg` 及以上浮层使用硬偏移加极轻扩散投影；只提取图片的色彩、排版、材质和层级原则，不复制人名、方程、文案或页面布局 |
| Neumorphism | 同色表面、明暗双向软阴影、凸起与凹陷 | 双层正负位移 shadow、inner shadow、大圆角、高对比前景修正 |
| Memphis | 八十年代明亮撞色、几何、反理性趣味 | 黄蓝粉绿、黑边、彩色硬阴影、块状几何字体与回弹 easing |
| Soft UI | 低饱和粉彩、舒适、柔和平面 | 蓝灰与薰衣草色、宽松圆角、单向弥散阴影；不使用浮雕双阴影 |
| Cyberpunk | 高科技/低生活、工业黑、霓虹冲突 | 酸性黄主色、电子青与霓虹粉、方角、等宽标题、有色光晕 |
| Y2K | 银铬、透明塑料、乐观复古未来主义 | 冰蓝薰衣草亮粉、胶囊曲线、铬反射渐变、塑料高光 |
| Retro Terminal | CRT 磷光、早期命令行、技术复古 | 黑绿与琥珀、全等宽字体、零圆角、无装饰层级、50–150ms 动效 |
| Paper | 象牙纸、印刷墨、手工装帧 | 阅读衬线、靛蓝标记、微压痕 inner shadow、极小圆角与纸面渐变 |
| Calm | 低饱和、稳定、舒展、无刺激 | 雾蓝与鼠尾草、1.12 密度、柔和阴影、300–460ms 无弹跳动效 |
| Playful | 高明度、多彩、夸张圆角、趣味反馈 | 紫蓝黄粉青、彩色硬边阴影、圆体粗字、轻回弹 easing |
| Premium | 稀缺感、深色、克制金、精细排版 | 乌木/深咖、香槟金、衬线 display、锐利小圆角、深层慢阴影 |
| Organic | 未漂白材料、苔绿陶土、自然生长 | 米色绿褐、人文衬线、层次不一的圆角、低光泽土色阴影 |
| Cottagecore | 亚麻、花卉、乡村手作、慢生活 | 米色鼠尾草干燥玫瑰、阅读衬线、纸面压痕、温暖旧木边界 |
| Nature | 森林、湖泊、岩石、沙土的完整户外色谱 | 绿蓝土色图表、稳健无衬线、适中圆角、地平线式明暗渐变 |
| Retro | 中世纪海报、旧印刷、怀旧宣传画 | 芥末黄砖红旧青绿、slab serif、宽字距、印刷硬偏移阴影 |
| Kawaii | 粉彩、圆润、亲切、轻盈可爱 | 粉蓝薄荷薰衣草、圆体粗字、胶囊曲线、蓬松阴影与柔和回弹 |
| Sunset | 地平线暖光、暮色紫、浪漫宁静 | 金橙珊瑚玫红紫渐变、优雅衬线标题、发光阴影、放缓动效 |

### 圆角语言

圆角是主题的形状语义，不是统一装饰。每款官方主题必须显式提供 `xs`、`sm`、`md`、`lg`、`xl`、`2xl` 六档值，且数值不得随层级增大而回退：

| 形状方向 | 主题 | 规则 |
|---|---|---|
| 直角 | Neo Brutalism、Cyberpunk、Retro Terminal、Manuscript | 六档均为 `0`，保持工业、机械、终端或纸页边界 |
| 近直角 | Editorial、Command Center、Line Art | 低层级为 `0`，大容器只保留极小圆角 |
| 小圆角 | Warm Reading、Monochrome Deploy、Precision Flow、Dashboard、Mono、Minimalism、Memphis、Paper、Premium、Retro、Punchcard、Sketchbook | 控件克制，大容器不突然跳成胶囊或大圆角 |
| 适中圆角 | Elevated Surface、Cottagecore、Nature | 提供日常产品所需的清晰层级，不过度柔化边界 |
| 大圆角 | Default、Ocean、Forest、Aurora、Bento UI、AI Native、Spatial UI、Glass、Neumorphism、Soft UI、Calm、Organic、Sunset | 卡片和材质层明显圆润，控件仍保持可辨识的层级差 |
| 夸张圆角 | Y2K、Playful、Kawaii、Soft Clay、Golden Bazaar | 从小控件开始放大曲率，`xl` / `2xl` 用于塑料感、趣味感和可爱感；Soft Clay 以高光、阴影和大体积感表达软陶，不复用 Neumorphism 的蓝灰软影；Golden Bazaar 以超大圆角和柔光橱窗层级表达轻盈零售感。 |

v2 的 full radius 是 CSS 常量（不是主题 token），只用于明确的胶囊、圆点、头像或图表柱等语义元素；普通卡片不得无条件使用 full radius。示例应用的卡片、面板、输入框与按钮必须消费对应 shape token，不能写死圆角值。

质量要求补充：每款主题必须拥有独立的浅色/深色色彩系统和独立视觉签名；`primary`/`secondary` 的 default、hover、active 不得使用同一颜色。除下述 Glass 例外外，语义表面仍须使用可静态计算对比度的实色，透明感由结构化 gradient、backdrop、透明边缘与多层 highlight shadow 表达；无法稳定保证正文对比度的透明背景/前景组合不直接照搬。Glass 自 2026-07-21 起是有意的文档化例外：raised 表面使用带 alpha 的半透明值（light `#f8f8f880`、dark `#101010a0`），dark selection 使用亮青 `#5bd0ff`；`surfaceRaised` 前景对比度因此不再静态可计算（light/dark 各一条警告），dark selection 对比度 1.68 低于 AA 正文建议（一条警告）。这三条警告是维护者确认的取舍，透明材质观感优先；其余 40 款预设继续满足零警告要求。

除单色主题外，所有预设使用相同且清晰的反馈语义：`danger` 是纯红、`success` 是中等明度绿、`warning` 是橙色、`info` 是明亮 sky blue；不得以紫红、深红、棕色或过深蓝色替代这些含义。浅色模式使用适合实色状态表面的 500 阶，深色模式使用更明亮的 300/400 阶；对应 foreground 仍必须在实色表面达到 WCAG AA。Mono、Monochrome Deploy、Minimalism 与 Line Art 按定位保留有明确明度顺序的灰阶反馈色，但界面不得只以颜色传达状态。

彩色主题的 `chart.1` 保留各自的主色以维持主题身份；`chart.2`–`chart.8` 必须按 primary 色相匹配相邻且易区分的数据色谱：冷蓝主题使用 cyan / teal / sky / blue / indigo，绿色主题使用 emerald / teal / sky / olive，紫系主题使用 indigo / violet / purple / fuchsia，暖橙主题使用 orange / amber / yellow / rose，玫红主题使用 rose / pink / fuchsia / violet。每条色谱都补足对比色，确保多序列数据可读。Feedback 继续独立使用红、绿、橙、sky blue 的明确语义，不能被图表风格色替代。Aurora、Glass、Cyberpunk 等特殊风格仍由主色、表面、渐变、材质、排版与形状表达个性，不得因图表或反馈色偏离明确的数据与状态语义。预设包物化最终 HEX，不在运行时依赖或导入整套基础色库。

稳定基础色库由 `@oriatheme/colors` 独立维护，不属于任何预设 ThemeDefinition。每款主题只负责自己的双模式语义颜色；主色和其余视觉 token 保持独立签名，但不得复制完整基础色库到主题或 runtime 输出。

## 规划身份

以下 ID 在代码发布后必须保持稳定。品牌工作名称若在发布复核中调整，必须在首次实现前同步修改对应 ID；不得先发布品牌 ID 再静默重命名。

```text
Default            → oria-default
Ocean              → oria-ocean
Forest             → oria-forest
Aurora             → oria-aurora

Warm Reading       → oria-warm-reading
Monochrome Deploy  → oria-monochrome-deploy
Precision Flow     → oria-precision-flow
Manuscript         → oria-manuscript
Elevated Surface   → oria-elevated-surface

Bento UI           → oria-bento-ui
Dashboard          → oria-dashboard
Editorial          → oria-editorial
AI Native          → oria-ai-native
Command Center     → oria-command-center
Spatial UI         → oria-spatial-ui

Mono               → oria-mono
Minimalism         → oria-minimalism
Line Art           → oria-line-art
Glass              → oria-glass
Neo Brutalism      → oria-neo-brutalism
Punchcard          → oria-punchcard
Sketchbook         → oria-sketchbook
Soft Clay          → oria-soft-clay
Golden Bazaar      → oria-golden-bazaar
Theorem            → oria-theorem
Neumorphism        → oria-neumorphism
Memphis            → oria-memphis
Soft UI            → oria-soft-ui
Cyberpunk          → oria-cyberpunk
Y2K                → oria-y2k
Retro Terminal     → oria-retro-terminal
Paper              → oria-paper

Calm               → oria-calm
Playful            → oria-playful
Premium            → oria-premium
Organic            → oria-organic
Cottagecore        → oria-cottagecore
Nature             → oria-nature
Retro              → oria-retro
Kawaii             → oria-kawaii
Sunset             → oria-sunset
```

## 现有 Oria 预设

| 主题 | 状态 | 描述 / 灵感 |
|---|---|---|
| Default | 已实现 | 参考冷白圆润 UI 重设计：亮青蓝主操作、轻盈悬浮表面、单层半透明细边高光和低对比阴影；Feedback 与 Chart 使用冷色连续序列及克制的 rose/amber 状态强调。 |
| Ocean | 已实现 | 清爽蓝色、明亮水面与深海层次，传达可靠、开放和专注。 |
| Forest | 已实现 | 自然绿色、低干扰表面与沉稳层次，适合健康、户外和可持续场景。 |
| Aurora | 已实现，纳入视觉风格类 | 多色光晕、渐变背景、梦幻与科技感。后续增强必须兼容现有 `oria-aurora` ID。 |

## 品牌与产品灵感类

原需求中的品牌工作名已经完成公开命名复核，全部替换为中性名称和 ID；不使用第三方商标、token、图标、字体或界面素材。下表保留灵感方向，方便追溯，且不表示合作、背书或兼容性。

| 公开主题 | 原工作名 / 灵感方向 | 描述 |
|---|---|---|
| Warm Reading | Claude | 温暖米白、柔和橙色、亲和、安静，强调长时间阅读体验。 |
| Monochrome Deploy | Vercel | 黑白极简、高对比、锐利排版与开发者工具感。 |
| Precision Flow | Linear | 深色界面、紫蓝层次、精密网格与专业高效的工作氛围。 |
| Manuscript | 文档工作台 | 冷雾灰背景、石墨控制、等宽标题、直角纸页和高亮细描边，强调阅读与轻量协作；仅提取视觉原则，不复制参考图的品牌、控件或布局。 |
| Elevated Surface | Material | 清晰表面层级、卡片、阴影和强调操作的浮动感；组件行为仍由消费应用负责。 |

## 设计语言类

以下主题均已实现。

| 主题 | 描述 / 灵感 |
|---|---|
| Bento UI | 模块化网格、多尺寸卡片与清楚的信息分区。 |
| Dashboard | 侧边栏语境、数据卡片、指标面板与较高功能密度。 |
| Editorial | 大标题、杂志排版、强烈文字层级与内容优先。 |
| AI Native | 对话流、生成状态、上下文卡片与智能推荐语境。 |
| Command Center | 深色背景、高密度信息、快捷键语境与实时状态反馈。 |
| Spatial UI | 悬浮面板、空间层次、景深与沉浸式布局语境。 |

## 视觉风格类

| 主题 | 状态 | 描述 / 灵感 |
|---|---|---|
| Mono | 已实现 | 黑白灰、单色阶、克制、专业，强调内容本身。 |
| Minimalism | 已实现 | 大面积留白、少量装饰、柔和黑色与深灰层级、功能优先。 |
| Line Art | 已实现 | 纯黑白、高反差细线轮廓、近直角和大面积负空间，强调描边而非体积。 |
| Glass | 已实现 | 冷色玻璃焦点、半透明浮起表面与表面渐变、多向边缘折射、内侧亮带和柔和悬浮层级；Feedback 与 Chart 使用同源棱镜色序。浅色保持正文可读；dark 为中性近黑玻璃，半透明 raised 表面与亮青 selection 的对比度警告属于文档化取舍。 |
| Neo Brutalism | 已实现 | 粗边框、强对比色、硬阴影，直接醒目。 |
| Punchcard | 已实现 | 暖纸统计板、黄/粉/浅蓝数据卡、适中圆角、统一墨黑硬偏移阴影、紧凑标签和白色表面上的规则小圆点；点阵通过可选 `pattern.surface` 的 dot 图层输出，不复制品牌、文案、素材或界面布局。 |
| Sketchbook | 已实现 | 暖白点阵纸、深墨线、手写字体栈与薄荷/柠檬/粉/蓝便利贴色系；`pattern.background` 的稀疏 dot 点阵与 `pattern.surface` 的 1px grid 墨线还原点阵纸与方格纸材质，不复制图片中的人物、文案、图标或具体布局。 |
| Soft Clay | 已实现 | 复古奶油底、灰褐文本、低饱和橙色强调、近白凸起面、夸张圆角和三层定向高光/阴影，形成厚实的软陶控制面板；参考图只提取可观察的材质与 token 原则，不复制界面、文案或布局。 |
| Golden Bazaar | 已实现 | 暖桃至蜜糖黄的环境渐层、奶油白卡片、明黄 primary、珊瑚 secondary、靛蓝 accent、超大圆角和暖色柔影，呈现阳光零售橱窗的轻盈层级；参考图只提取可观察的视觉原则，不复制品牌、商品、图标、文案或页面布局。 |
| Theorem | 已实现 | 暖白讲义画布以炭黑 `scrim` 形成遮罩后的暖灰背景，`pattern.background` 的安全 Paper noise 图层还原纸面纤维；象牙白无圆角浮层、炭黑衬线排版、酒红批注强调、1px 细边与仅供 `lg` 及以上浮层使用的硬偏移投影；常规卡片无阴影。参考图只提取可观察的色彩、排版、材质和层级原则，不复制人名、方程、文案或页面布局。 |
| Neumorphism | 已实现 | 低对比度、柔和内外阴影与浮雕般控件质感。 |
| Memphis | 已实现 | 几何图形、鲜艳配色、活泼装饰与八九十年代气质。 |
| Soft UI | 已实现 | 柔和圆角、低对比度、浅色背景，舒适温和。 |
| Aurora | 已实现 | 多色光晕、渐变背景、梦幻与科技感；复用现有主题。 |
| Cyberpunk | 已实现 | 黑底、霓虹色、故障感和高对比未来气质。 |
| Y2K | 已实现 | 银色金属、亮色渐变、透明塑料与复古未来主义。 |
| Retro Terminal | 已实现 | 等宽字体、绿色或琥珀色、命令行与技术复古感。 |
| Paper | 已实现 | 纸张纹理语境、墨色、印刷排版与手工出版物质感。 |

## 情绪与场景类

以下主题均已实现。

| 主题 | 描述 / 灵感 |
|---|---|
| Calm | 低饱和色、柔和阴影、舒缓节奏，适合专注和健康应用。 |
| Playful | 明亮配色、夸张圆角、插画语境，轻松有趣。 |
| Premium | 黑金或深色系、精致排版、丰富细节与高级感。 |
| Organic | 米色、绿色、不规则形状语境与自然材质。 |
| Cottagecore | 手作感、纸张、花卉与复古色。 |
| Nature | 森林、海洋、沙漠等自然色彩，强调环保与户外氛围。 |
| Retro | 复古字体、旧海报配色、颗粒质感与怀旧气息。 |
| Kawaii | 粉彩色、可爱图标语境、圆润形状，轻松亲切。 |
| Sunset | 暖橙、柔和渐变、黄昏光线，浪漫而宁静。 |

## 运行时目录

主题描述、关键词、设计依据、实现状态和命名复核属于本文档，不进入发布包。`@oriatheme/presets` 只从 package root 导出运行时消费真正需要的只读 `oriaPresetCatalog`：

```ts
export type PresetCategory =
  | "oria"
  | "brand-product"
  | "design-language"
  | "visual-style"
  | "mood-context";

export interface PresetCatalogEntry {
  readonly theme: ThemeDefinition;
  readonly category: PresetCategory;
}

export const oriaPresetCatalog: readonly PresetCatalogEntry[];
```

`theme` 是完整且已实现的官方 `ThemeDefinition`；ID 和名称直接读取 `theme.id` / `theme.name`，不在目录项中重复保存。数组位置就是稳定预览顺序，不再重复保存 `order`。每个目录项只额外提供分类：`oria`、`brand-product`、`design-language`、`visual-style` 或 `mood-context`。

`oriaPresetThemes` 仍是完整主题数组，并与 `oriaPresetCatalog.map(entry => entry.theme)` 保持同序一致。未实现、废弃或命名复核信息只记录在本文档和项目日志中，不作为运行时数据发布。
