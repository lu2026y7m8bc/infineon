#!/usr/bin/env node
/**
 * seed-products.mjs — 生成 data/products.json
 * 结构化型号事实 + 模板化原创描述/FAQ，保证字段完整、字数达标。
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, '..', 'data', 'products.json');

const brand = { name: '英飞凌', nameEn: 'Infineon', company: '力通', companyEn: 'litong' };

function faq(q, a, d) {
  return { question: q, answer: a, decisionGuide: d };
}

function paramsText(m) {
  return Object.entries(m.params).map(([k, v]) => `${k} ${v}`).join('，');
}

function deepDesc(m, c) {
  const apps = m.applications.join('、');
  const alt = m.alternatives.length ? m.alternatives.join('、') : '同系列相邻型号';
  return [
    `${m.model} 是英飞凌 ${m.series} 系列中面向 ${c.name} 应用的经典型号，常见于 ${apps} 等场景。该系列在英飞凌产品线中定位清晰，兼顾性能、可靠性与供货稳定性，适合需要长期供货、批次追溯与本地技术支持的项目。对于正在做方案评估的工程师而言，理解它在系列中的位置，比单独比较某一个参数更重要。`,
    `从关键参数看，${paramsText(m)}，封装为 ${m.package}。这些指标共同决定了器件在目标应用中的适配性：参数决定电气裕量与热设计边界，封装影响 PCB 占位、散热路径与装配工艺。选型时应把负载特性、开关频率、环境温度、EMC 要求与寿命目标放在一起评估，避免只看单一指标而忽略系统级约束。`,
    `在典型项目中，${m.model} 常用于 ${apps}。以 ${m.applications[0]} 为例，设计时需要同时考虑驱动能力、保护策略与散热条件；如果负载波动较大，还应预留足够的电压与电流裕量。对于需要长期运行的系统，建议在样机阶段完成温升、开关波形与EMC的联合测试，再确定最终外围参数。`,
    `选型与替代方面，可优先参考 ${alt} 等同系列型号，并结合实际参数逐项比对，而不是仅凭型号后缀判断。若项目对封装、温度等级或供货周期有特殊要求，可把完整参数表提交给力通 FAE，由工程师协助做替代料验证与BOM优化。力通可提供规格书索取、样品申请与批次信息核对，帮助缩短导入周期。`,
    `供货与支持方面，${m.model} 在力通可按 ${m.stock === 'in-stock' ? '现货' : '询价'} 处理，常用数量可快速响应；紧缺批次会同步给出预计交期与替代建议。力通在香港、北京、上海、深圳设有服务团队，可配合完成选型、样品、量产备货与出口报关等环节，降低项目在采购端的风险。`,
    `此外，建议在选型阶段同步确认供货状态与生命周期，避免样机通过后才发现交期或停产风险。力通可提供批次信息、替代料建议与长期供货计划，帮助把采购风险前置管理；涉及认证或特殊温度等级时，也可提前核对文件与批次，减少量产阶段的变更成本。`
  ].join('\n\n');
}

function stdDesc(m, c) {
  return `${m.model} 是英飞凌 ${m.series} 系列的 ${c.name} 型号，封装为 ${m.package}，${paramsText(m)}。适用于 ${m.applications.join('、')} 等场景。力通可提供 ${m.stock === 'in-stock' ? '现货' : '询价'} 支持，并可协助做替代料比对与样品申请，具体参数以最新规格书为准。若需做替代或小批量试产，可提交完整参数表由力通 FAE 协助核对。`;
}

function modelFaq(m, c, count) {
  const list = [
    faq(`${m.model} 的封装和 PCB 布局需要注意什么？`, [
      `${m.model} 采用 ${m.package} 封装，布局时应先确认焊盘尺寸、引脚间距与散热焊盘设计，并按规格书建议预留爬电距离与散热过孔。`,
      `对于 ${c.name} 应用，建议把功率回路与敏感信号分开布置，缩短高频回路面积；样机阶段通过温升与波形测试确认布局余量。`
    ], `下载规格书或联系 FAE 获取布局建议。`),
    faq(`${m.model} 有哪些可考虑的替代型号？`, [
      `可优先在同系列中选择参数接近的型号，例如 ${m.alternatives.length ? m.alternatives.join('、') : '相邻规格型号'}，并逐项核对耐压、电流、封装与温度等级。`,
      `替代不是简单替换型号，还要复核驱动、保护与散热条件；建议把原型号与新候选的完整参数表并列比对。`
    ], `提交原型号与项目参数，由 FAE 给出替代清单。`),
    faq(`${m.model} 的现货与交期如何？`, [
      `${m.model} 当前按 ${m.stock === 'in-stock' ? '现货' : '询价'} 处理。常用数量通常可快速安排，紧缺批次会给出预计交期。`,
      `如需锁货或分批交付，请在询价时注明数量、交期与项目阶段，力通会结合香港与深圳仓库存协调。`
    ], `提交型号与数量，获取实时库存与交期。`),
    faq(`${m.model} 适合哪些应用？`, [
      `${m.model} 常见于 ${m.applications.join('、')}。选型时应结合负载、开关频率与环境温度确认是否满足裕量要求。`,
      `若应用涉及高可靠或功能安全场景，还需确认温度等级、认证与长期供货计划。`
    ], `查看同类方案，或让 FAE 按应用场景推荐。`),
    faq(`${m.model} 如何申请样品或获取报价？`, [
      `可通过联系我们页面提交型号、数量、目标交期与项目阶段，销售会回复报价与样品政策。`,
      `技术问题会同步转交 FAE，便于在样品阶段一起确认外围设计与测试条件。`
    ], `前往联系我们提交询价或样品申请。`),
    faq(`${m.model} 的参数以哪个版本为准？`, [
      `页面参数用于选型参考，最终应以英飞凌最新数据手册与批次标签为准。`,
      `若项目对参数容差、温度等级或认证有硬性要求，请在询价时注明，我们会提供对应批次文件。`
    ], `索取最新规格书并核对批次信息。`)
  ];
  return list.slice(0, count);
}

function catFaq(c) {
  return c.faq;
}

const cats = [
  {
    slug: 'mcu',
    name: 'MCU 微控制器',
    icon: 'assets/img/icon-mcu.svg',
    description: '英飞凌 MCU 微控制器覆盖 AURIX™、XMC™ 与 PSoC™ 等系列，面向汽车电子、工业控制、电机驱动与物联网终端。AURIX™ 强调实时性、功能安全与多核架构，XMC™ 偏向工业电机与功率控制，PSoC™ 则把可编程模拟与数字外设集成到同一芯片。选型时应结合主频、Flash/RAM、外设接口、封装与温度等级综合评估，并预留软件与认证成本。力通提供英飞凌MCU代理、现货与 FAE 选型支持，帮助缩短导入周期。',
    applications: [
      { name: '汽车电子', desc: '车身控制、域控制器与电驱控制。' },
      { name: '工业控制', desc: 'PLC、伺服与变频器实时控制。' },
      { name: '电机驱动', desc: 'BLDC/PMSM 的磁场定向控制。' },
      { name: '物联网终端', desc: '低功耗采集与人机交互。' }
    ],
    advantages: [
      { title: '实时性强', desc: '多核与硬件外设降低中断延迟。' },
      { title: '安全能力', desc: '部分系列支持功能安全与信息安全。' },
      { title: '生态完善', desc: '开发板、工具链与例程齐全。' },
      { title: '供货稳定', desc: '主流型号常备现货，交期可控。' }
    ],
    guideLink: { label: '如何选择最适合您项目的英飞凌MCU？', url: '/support/guides/how-to-choose-infineon-mcu.html' },
    faeReview: { author: '李工（MCU/嵌入式 FAE，12 年）', text: '实际项目里，MCU 选型最容易犯的错是只看主频。先把外设接口、Flash 余量、封装与温度等级定下来，再回头看主频，往往能避免后期改板。' },
    alternatives: [{ model: 'TC375', url: '/products/mcu/tc375.html' }, { model: 'XMC1404', url: '/products/mcu/xmc1404.html' }],
    companions: [{ model: 'TLE5012B', url: '/products/sensors/tle5012b.html' }, { model: 'TLI4971', url: '/products/sensors/tli4971.html' }],
    faq: [
      faq('英飞凌MCU有哪些系列？AURIX、XMC、PSoC 如何区分？', ['AURIX™ 面向汽车与高实时控制，强调多核、功能安全与信息安全；XMC™ 面向工业电机、功率转换与实时控制；PSoC™ 把可编程模拟与数字外设集成到同一芯片，适合需要灵活外设的嵌入式项目。', '选型时先看应用场景与认证要求，再看主频、Flash、外设与封装。汽车项目优先 AURIX™，工业电机优先 XMC™，需要自定义模拟前端时可评估 PSoC™。'], '点击表格中的型号查看详情，或提交项目参数由 FAE 协助选型。'),
      faq('如何根据主频和 Flash 选择 MCU？', ['主频决定控制环路的计算余量，Flash/RAM 决定协议栈、算法与升级空间。建议按最坏情况估算：控制周期内要完成的运算量、通信缓冲、日志与固件升级分区都要计入。', '一般预留 30% 以上的 Flash 与 RAM 余量，避免后期加功能时被迫换料。若涉及电机 FOC 或复杂通信，主频与 Flash 应一起评估。'], '使用表格按主频/Flash 筛选，或让 FAE 按项目参数推荐。'),
      faq('表格中的参数列如何高效筛选？', ['表格每个参数列都支持排序，点击表头即可升序/降序；关键字搜索可快速定位型号、系列或封装。筛选后结果计数会同步更新，便于在候选型号之间对比。', '建议先按封装与温度等级筛选，再比较主频、Flash 与外设，最后核对供货状态。'], '在表格中筛选出候选型号后，点击型号进入详情页查看完整参数。'),
      faq('AURIX 和 XMC 在汽车/工业应用中的差异是什么？', ['AURIX™ 更强调实时性、多核锁步与功能安全，适合汽车域控制、电驱与底盘等场景；XMC™ 更偏向工业电机、电源与传感器接口，外设组合灵活、成本更友好。', '如果项目需要功能安全认证或汽车级温度等级，优先评估 AURIX™；如果是工业变频、伺服或 BLDC 控制，XMC™ 往往更合适。'], '查看对应分类的型号表格，或联系 FAE 做场景化选型。'),
      faq('封装选择（LQFP、BGA、QFN）要注意什么？', ['LQFP 便于手工调试与返修，BGA 引脚多、适合高密度设计但对 PCB 与焊接要求高，QFN 体积小、散热好但焊盘与散热过孔设计要规范。', '选型时要同时考虑 PCB 层数、散热、装配工艺与售后返修成本，不要只看体积。'], '在表格中按封装筛选，并让 FAE 复核布局与焊接工艺。'),
      faq('如何判断 MCU 是否适合功能安全项目？', ['需要确认芯片是否具备对应的安全等级、锁步核、内存保护与故障注入能力，并核对认证文件与开发工具链支持。', '功能安全不仅是芯片选型，还包括软件流程、诊断覆盖与文档体系；建议在项目早期就引入 FAE 评估。'], '提交安全等级与项目目标，由 FAE 给出选型与资料清单。'),
      faq('英飞凌 MCU 的替代料如何选择？', ['优先在同系列中找参数接近的型号，逐项核对主频、Flash/RAM、外设、封装与温度等级，并确认引脚兼容性。', '替代后要重新验证时序、功耗与 EMC，不能只看型号后缀。'], '把原型号与参数表提交给我们，FAE 会给出替代清单与验证建议。'),
      faq('如何获取 MCU 样品与报价？', ['通过联系我们页面提交型号、数量、目标交期与项目阶段，销售会回复报价与样品政策。', '技术问题会同步转交 FAE，便于在样品阶段确认外围设计与测试条件。'], '前往联系我们提交询价或样品申请。')
    ],
    models: [
      { model: 'TC397', slug: 'tc397', series: 'AURIX™ TC3xx', depth: 'deep', params: { '主频': '300 MHz', 'Flash': '16 MB', 'RAM': '6.9 MB', '温度': '-40~125℃' }, package: 'LFBGA-292', stock: 'in-stock', shortDesc: 'AURIX™ TC3xx 多核 MCU，面向汽车域控制与高实时应用。', applications: ['汽车域控制器', '电驱控制', '底盘与安全系统'], alternatives: ['TC375', 'XMC4800'], companions: ['TLE5012B', 'TLI4971'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '选型手册', url: '/support/guides/how-to-choose-infineon-mcu.html' }], images: ['assets/img/product-mcu.svg'] },
      { model: 'XMC4800', slug: 'xmc4800', series: 'XMC™ 4000', depth: 'deep', params: { '主频': '144 MHz', 'Flash': '2 MB', 'RAM': '352 KB', '温度': '-40~85℃' }, package: 'LQFP-144', stock: 'in-stock', shortDesc: 'XMC™ 4000 工业 MCU，集成 EtherCAT 与电机控制外设。', applications: ['工业电机驱动', '伺服控制', '工业通信'], alternatives: ['XMC1404', 'TC397'], companions: ['IKW40N65H5', 'TLE5012B'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '应用笔记', url: '/support/app-notes/igbt-gate-driver-design.html' }], images: ['assets/img/product-mcu.svg'] },
      { model: 'XMC1302', slug: 'xmc1302', series: 'XMC™ 1000', depth: 'standard', params: { '主频': '32 MHz', 'Flash': '200 KB', 'RAM': '16 KB', '温度': '-40~85℃' }, package: 'TSSOP-38', stock: 'in-stock', shortDesc: '低成本工业 MCU，适合 BLDC 与小型电机控制。', applications: ['BLDC 电机', '风扇控制', '小功率电源'], alternatives: ['XMC1404'], companions: ['BSC0902NSI'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mcu.svg'] },
      { model: 'CY8C5888', slug: 'cy8c5888', series: 'PSoC™ 5LP', depth: 'standard', params: { '主频': '80 MHz', 'Flash': '256 KB', 'RAM': '64 KB', '温度': '-40~85℃' }, package: 'QFN-68', stock: 'inquiry', shortDesc: '可编程模拟+数字外设，适合灵活前端设计。', applications: ['传感器接口', '工业仪表', '人机交互'], alternatives: ['XMC1302'], companions: ['DPS368'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mcu.svg'] },
      { model: 'TC375', slug: 'tc375', series: 'AURIX™ TC3xx', depth: 'standard', params: { '主频': '300 MHz', 'Flash': '10 MB', 'RAM': '5.4 MB', '温度': '-40~125℃' }, package: 'LFBGA-292', stock: 'in-stock', shortDesc: 'AURIX™ 多核 MCU，适合域控制与实时控制。', applications: ['车身域控制', '电机控制', '安全系统'], alternatives: ['TC397'], companions: ['TLE5012B'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mcu.svg'] },
      { model: 'XMC1404', slug: 'xmc1404', series: 'XMC™ 1400', depth: 'standard', params: { '主频': '48 MHz', 'Flash': '128 KB', 'RAM': '16 KB', '温度': '-40~105℃' }, package: 'LQFP-64', stock: 'in-stock', shortDesc: '工业级 MCU，适合电机与功率转换控制。', applications: ['电机控制', '电源转换', '工业接口'], alternatives: ['XMC1302'], companions: ['IPP60R099P7'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mcu.svg'] }
    ]
  },
  {
    slug: 'igbt',
    name: 'IGBT 功率器件',
    icon: 'assets/img/icon-igbt.svg',
    description: '英飞凌 IGBT 功率器件覆盖模块与分立器件，广泛应用于电机驱动、光伏逆变、储能 PCS、充电桩与工业电源。模块方案集成度高、适合中大功率与快速装配，分立器件则灵活、便于成本优化。选型时应结合耐压、电流、开关频率、短路能力、封装与散热条件综合评估，并预留足够的电压与电流裕量。模块与分立器件在散热、装配与维护上各有取舍，建议结合功率等级与结构设计一起决策。力通提供英飞凌IGBT代理、现货与 FAE 驱动/散热支持。',
    applications: [
      { name: '电机驱动', desc: '变频器、伺服与电驱逆变。' },
      { name: '光伏储能', desc: '组串逆变与储能 PCS。' },
      { name: '充电与电源', desc: '充电模块与工业电源。' },
      { name: '工业加热', desc: '感应加热与焊接电源。' }
    ],
    advantages: [
      { title: '功率覆盖广', desc: '从分立到中大功率模块。' },
      { title: '开关损耗低', desc: '多代沟槽/场截止技术。' },
      { title: '可靠性高', desc: '适合长期运行与严苛环境。' },
      { title: '配套齐全', desc: '驱动、散热与保护方案完善。' }
    ],
    guideLink: { label: 'IGBT 驱动电路设计与栅极电阻选型实战', url: '/support/app-notes/igbt-gate-driver-design.html' },
    faeReview: { author: '张工（功率器件 FAE，15 年）', text: 'IGBT 选型不要只盯电流。先把母线电压、短路要求与开关频率定下来，再反推耐压、电流与封装，散热往往才是项目后期真正的瓶颈。' },
    alternatives: [{ model: 'FF300R12ME4', url: '/products/igbt/ff300r12me4.html' }, { model: 'IKW25N120H3', url: '/products/igbt/ikw25n120h3.html' }],
    companions: [{ model: 'XMC4800', url: '/products/mcu/xmc4800.html' }, { model: 'TLI4971', url: '/products/sensors/tli4971.html' }],
    faq: [
      faq('IGBT 模块与分立器件如何选择？', ['模块集成度高、装配快、适合中大功率与多并联场景；分立器件灵活、成本可控，适合中小功率或空间受限的设计。', '选型时要综合功率等级、散热、装配工艺、维护成本与供货稳定性，不要只看单颗价格。'], '按功率与封装筛选表格，或提交方案由 FAE 评估。'),
      faq('耐压和电流余量如何确定？', ['耐压要覆盖母线电压、开关过冲与浪涌，通常预留 1.5–2 倍裕量；电流要结合负载曲线、结温与短路要求评估。', '余量不是越大越好，过大可能带来更高损耗与成本，建议用实际工况做热仿真与样机验证。'], '提供母线电压、负载与开关频率，由 FAE 协助核算。'),
      faq('表格中的参数列如何筛选？', ['表格支持按耐压、电流与封装排序和筛选，点击表头即可切换升降序。关键字搜索可快速定位模块或分立型号。', '建议先按耐压与封装筛出候选，再比较电流、短路能力与开关损耗。'], '筛选后点击型号进入详情页查看完整参数与替代料。'),
      faq('1200V 与 650V IGBT 的应用差异？', ['650V 适合低压母线、开关频率较高的场景；1200V 适合 690V 级母线、光伏与工业驱动等更高电压应用。', '耐压提高通常伴随导通与开关损耗变化，需结合频率与散热重新评估。'], '查看对应耐压型号，或让 FAE 按母线电压推荐。'),
      faq('封装（EconoDUAL、TO-247）如何选择？', ['EconoDUAL 等模块封装适合中大功率、便于并联与快速装配；TO-247 等分立封装灵活、便于成本优化与单管替换。', '封装还影响散热路径、爬电距离与装配工艺，需与结构工程师一起确认。'], '按封装筛选表格，或索取封装尺寸与散热建议。'),
      faq('如何评估 IGBT 的开关损耗与散热？', ['开关损耗与母线电压、电流、栅极电阻、温度相关；散热则取决于结到壳热阻、散热器与风冷/水冷条件。', '建议在样机上测开关波形与温升，再迭代栅极电阻与散热设计，避免只按手册典型值估算。'], '参考驱动应用笔记，或让 FAE 协助热设计复核。'),
      faq('IGBT 替代料号如何匹配？', ['优先在同系列中匹配耐压、电流、封装与短路能力，并核对引脚与驱动接口。', '替代后要重新验证开关损耗、温升与保护阈值，必要时调整栅极电阻。'], '提交原型号与工况，FAE 给出替代清单与验证项。'),
      faq('如何获取 IGBT 报价与交期？', ['通过联系我们提交型号、数量、目标交期与项目阶段，销售会回复报价与批次信息。', '紧缺模块会同步给出替代方案与预计交期，便于项目排产。'], '前往联系我们提交询价。')
    ],
    models: [
      { model: 'FF450R12ME4', slug: 'ff450r12me4', series: 'EconoDUAL™ 3', depth: 'deep', params: { '耐压': '1200 V', '电流': '450 A', '类型': 'IGBT 模块', '温度': '-40~150℃' }, package: 'EconoDUAL 3', stock: 'inquiry', shortDesc: '1200V/450A IGBT 模块，适合电驱与工业变频。', applications: ['电驱逆变', '工业变频', '光伏逆变'], alternatives: ['FF300R12ME4', 'FF600R12ME4'], companions: ['XMC4800', 'TLI4971'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '驱动应用笔记', url: '/support/app-notes/igbt-gate-driver-design.html' }], images: ['assets/img/product-igbt.svg'] },
      { model: 'IKW40N65H5', slug: 'ikw40n65h5', series: 'HighSpeed 5', depth: 'deep', params: { '耐压': '650 V', '电流': '40 A', '类型': '分立 IGBT', '温度': '-40~175℃' }, package: 'TO-247', stock: 'in-stock', shortDesc: '650V/40A 分立 IGBT，适合焊机与电源。', applications: ['工业电源', '焊机', '电机驱动'], alternatives: ['IKW25N120H3', 'IKD15N60RC2'], companions: ['IPP60R099P7', 'XMC1404'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '驱动应用笔记', url: '/support/app-notes/igbt-gate-driver-design.html' }], images: ['assets/img/product-igbt.svg'] },
      { model: 'FF300R12ME4', slug: 'ff300r12me4', series: 'EconoDUAL™ 3', depth: 'standard', params: { '耐压': '1200 V', '电流': '300 A', '类型': 'IGBT 模块', '温度': '-40~150℃' }, package: 'EconoDUAL 3', stock: 'in-stock', shortDesc: '1200V/300A 模块，适合变频与储能。', applications: ['工业变频', '储能 PCS', '电驱'], alternatives: ['FF450R12ME4'], companions: ['XMC4800'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-igbt.svg'] },
      { model: 'IKW25N120H3', slug: 'ikw25n120h3', series: 'HighSpeed 3', depth: 'standard', params: { '耐压': '1200 V', '电流': '25 A', '类型': '分立 IGBT', '温度': '-40~150℃' }, package: 'TO-247', stock: 'in-stock', shortDesc: '1200V/25A 分立 IGBT，适合高压电源。', applications: ['高压电源', '感应加热', '电机驱动'], alternatives: ['IKW40N65H5'], companions: ['XMC1404'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-igbt.svg'] },
      { model: 'IKD15N60RC2', slug: 'ikd15n60rc2', series: 'RC-H2', depth: 'standard', params: { '耐压': '600 V', '电流': '15 A', '类型': '分立 IGBT', '温度': '-40~175℃' }, package: 'TO-252', stock: 'in-stock', shortDesc: '600V/15A 带续流二极管，适合小功率驱动。', applications: ['小功率电机', '家电', '电源'], alternatives: ['IKW40N65H5'], companions: ['BSC0902NSI'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-igbt.svg'] },
      { model: 'FF600R12ME4', slug: 'ff600r12me4', series: 'EconoDUAL™ 3', depth: 'standard', params: { '耐压': '1200 V', '电流': '600 A', '类型': 'IGBT 模块', '温度': '-40~150℃' }, package: 'EconoDUAL 3', stock: 'inquiry', shortDesc: '1200V/600A 大功率模块，适合重载变频。', applications: ['重载变频', '电驱', '储能'], alternatives: ['FF450R12ME4'], companions: ['XMC4800'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-igbt.svg'] }
    ]
  },
  {
    slug: 'mosfet',
    name: 'MOSFET',
    icon: 'assets/img/icon-mosfet.svg',
    description: '英飞凌 MOSFET 覆盖 CoolMOS™ 高压超结与 OptiMOS™ 中低压沟槽系列，广泛用于开关电源、电机驱动、充电器与负载开关。CoolMOS™ 侧重高压低导通损耗，OptiMOS™ 侧重低栅极电荷与高频效率。选型时要结合耐压、RDS(on)、栅极电荷、封装与散热综合评估，并注意驱动电压与 EMI 的平衡。高频设计还要关注栅极驱动、寄生电感与布局，建议在样机阶段同时测效率与温升。力通提供英飞凌MOSFET代理、现货与 FAE 选型支持。',
    applications: [
      { name: '开关电源', desc: 'AC-DC、DC-DC 与 PFC。' },
      { name: '电机驱动', desc: 'BLDC 与低压电机。' },
      { name: '充电器', desc: '快充与适配器。' },
      { name: '负载开关', desc: '电池保护与热插拔。' }
    ],
    advantages: [
      { title: '低导通损耗', desc: 'RDS(on) 与品质因数优化。' },
      { title: '高频效率', desc: '低栅极电荷，适合高频开关。' },
      { title: '封装丰富', desc: 'TO、SuperSO8、D2PAK 等。' },
      { title: '供货稳定', desc: '主流型号常备现货。' }
    ],
    guideLink: { label: 'MOSFET 开关损耗与过热问题排查手册', url: '/support/troubleshooting/mosfet-overheat.html' },
    faeReview: { author: '张工（功率器件 FAE，15 年）', text: 'MOSFET 选型常见误区是只比 RDS(on)。栅极电荷、输出电容与封装热阻同样关键，尤其在频率上来之后，开关损耗会迅速超过导通损耗。' },
    alternatives: [{ model: 'IPW60R041P6', url: '/products/mosfet/ipw60r041p6.html' }, { model: 'BSC030N08NS5', url: '/products/mosfet/bsc030n08ns5.html' }],
    companions: [{ model: 'XMC1302', url: '/products/mcu/xmc1302.html' }, { model: 'TLI4971', url: '/products/sensors/tli4971.html' }],
    faq: [
      faq('CoolMOS 与 OptiMOS 的区别是什么？', ['CoolMOS™ 是高压超结技术，强调高压下的低导通损耗与效率，常见于 PFC、AC-DC 与工业电源；OptiMOS™ 是中低压沟槽技术，强调低栅极电荷与高频效率，适合 DC-DC、电机与负载开关。', '选型先看母线电压与应用频率，再比较 RDS(on)、Qg 与封装热阻。'], '按耐压筛选表格，或提交应用参数由 FAE 推荐。'),
      faq('RDS(on) 与耐压如何权衡？', ['耐压提高通常会增加导通电阻与芯片面积，RDS(on) 与耐压、成本之间存在权衡。', '建议在满足电压裕量的前提下，结合工作电流与温升选择 RDS(on)，不要盲目追求最低值。'], '提供母线电压与电流，让 FAE 协助计算损耗。'),
      faq('表格中的参数列如何筛选？', ['表格支持按耐压、电流与 RDS(on) 排序筛选，点击表头切换升降序；关键字可搜索型号与封装。', '建议先按耐压与封装筛选，再比较 RDS(on)、Qg 与供货状态。'], '筛选后点击型号查看详情与替代料。'),
      faq('高压与低压 MOSFET 的应用差异？', ['高压 MOSFET 多用于 PFC、AC-DC 与工业电源，关注耐压与开关损耗；低压 MOSFET 多用于 DC-DC、电机与负载开关，关注 RDS(on) 与电流能力。', '低压应用还要注意驱动电压与导通电阻的匹配，避免驱动不足导致发热。'], '查看对应耐压区间的型号，或让 FAE 按拓扑推荐。'),
      faq('封装（TO-220、SuperSO8、D2PAK）如何选择？', ['TO-220 便于散热与手工装配；SuperSO8 体积小、适合高密度与自动化贴装；D2PAK 兼顾功率与贴装。', '封装选择要结合散热、PCB 面积、装配工艺与成本，必要时做热仿真。'], '按封装筛选表格，或索取封装热阻数据。'),
      faq('如何降低 MOSFET 的开关损耗与过热？', ['可从降低开关频率、优化栅极电阻、选择低 Qg 器件、改善散热与布局入手。', '过热往往来自驱动不足、散热不良或回路寄生电感过大，建议先测波形与温升定位根因。'], '阅读过热排查手册，或让 FAE 协助定位。'),
      faq('MOSFET 替代料号如何选择？', ['优先匹配耐压、RDS(on)、电流、Qg 与封装，并核对驱动电压与引脚定义。', '替代后要复测效率、温升与 EMI，避免只看静态参数。'], '提交原型号与工况，FAE 给出替代清单。'),
      faq('如何获取 MOSFET 样品与报价？', ['通过联系我们提交型号、数量与项目阶段，销售会回复报价与样品政策。', '技术问题会转交 FAE，便于确认驱动与散热设计。'], '前往联系我们提交询价或样品申请。')
    ],
    models: [
      { model: 'IPP60R099P7', slug: 'ipp60r099p7', series: 'CoolMOS™ P7', depth: 'deep', params: { '耐压': '600 V', '电流': '38 A', 'RDS(on)': '99 mΩ', '温度': '-40~150℃' }, package: 'TO-220', stock: 'in-stock', shortDesc: '600V CoolMOS P7，适合 PFC 与开关电源。', applications: ['PFC', 'AC-DC 电源', '工业电源'], alternatives: ['IPW60R041P6', 'IPA60R280P7'], companions: ['XMC1404', 'TLI4971'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '过热排查', url: '/support/troubleshooting/mosfet-overheat.html' }], images: ['assets/img/product-mosfet.svg'] },
      { model: 'BSC0902NSI', slug: 'bsc0902nsi', series: 'OptiMOS™', depth: 'deep', params: { '耐压': '30 V', '电流': '100 A', 'RDS(on)': '2.1 mΩ', '温度': '-55~150℃' }, package: 'SuperSO8', stock: 'in-stock', shortDesc: '30V OptiMOS，低 RDS(on)，适合 DC-DC 与电机。', applications: ['DC-DC 转换', 'BLDC 电机', '负载开关'], alternatives: ['BSC030N08NS5', 'IPB80N06S4'], companions: ['XMC1302', 'TLI4971'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '过热排查', url: '/support/troubleshooting/mosfet-overheat.html' }], images: ['assets/img/product-mosfet.svg'] },
      { model: 'IPW60R041P6', slug: 'ipw60r041p6', series: 'CoolMOS™ P6', depth: 'standard', params: { '耐压': '600 V', '电流': '78 A', 'RDS(on)': '41 mΩ', '温度': '-40~150℃' }, package: 'TO-247', stock: 'inquiry', shortDesc: '600V CoolMOS P6，适合高功率 PFC。', applications: ['PFC', '工业电源', '光伏'], alternatives: ['IPP60R099P7'], companions: ['XMC1404'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mosfet.svg'] },
      { model: 'BSC030N08NS5', slug: 'bsc030n08ns5', series: 'OptiMOS™ 5', depth: 'standard', params: { '耐压': '80 V', '电流': '100 A', 'RDS(on)': '3.0 mΩ', '温度': '-55~150℃' }, package: 'SuperSO8', stock: 'in-stock', shortDesc: '80V OptiMOS 5，适合电机与同步整流。', applications: ['电机驱动', '同步整流', 'DC-DC'], alternatives: ['BSC0902NSI'], companions: ['XMC1302'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mosfet.svg'] },
      { model: 'IPB80N06S4', slug: 'ipb80n06s4', series: 'OptiMOS™ 4', depth: 'standard', params: { '耐压': '60 V', '电流': '80 A', 'RDS(on)': '4.5 mΩ', '温度': '-55~175℃' }, package: 'D2PAK', stock: 'in-stock', shortDesc: '60V OptiMOS 4，适合汽车与工业负载。', applications: ['汽车负载', '电机驱动', '电源'], alternatives: ['BSC030N08NS5'], companions: ['TLE5012B'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mosfet.svg'] },
      { model: 'IPA60R280P7', slug: 'ipa60r280p7', series: 'CoolMOS™ P7', depth: 'standard', params: { '耐压': '600 V', '电流': '14 A', 'RDS(on)': '280 mΩ', '温度': '-40~150℃' }, package: 'TO-220 FullPAK', stock: 'in-stock', shortDesc: '600V CoolMOS P7，适合小功率电源与适配器。', applications: ['适配器', '小功率电源', 'LED 驱动'], alternatives: ['IPP60R099P7'], companions: ['XMC1302'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-mosfet.svg'] }
    ]
  },
  {
    slug: 'sensors',
    name: '传感器',
    icon: 'assets/img/icon-sensors.svg',
    description: '英飞凌传感器覆盖磁角度、霍尔线性、电流、压力与飞行时间等类型，广泛用于电机位置检测、电流监测、压力测量与消费/工业人机交互。磁传感器适合非接触角度与转速检测，电流传感器用于逆变与电源保护，压力传感器则用于环境与流体监测。选型时应结合量程、精度、接口、封装与温度补偿综合评估。安装公差、磁铁/介质与校准流程往往决定最终精度，建议在结构设计早期就引入规格书。力通提供英飞凌传感器代理、现货与 FAE 集成支持。',
    applications: [
      { name: '电机位置', desc: 'BLDC/PMSM 转子角度检测。' },
      { name: '电流监测', desc: '逆变、电源与电池保护。' },
      { name: '压力测量', desc: '环境、流体与高度检测。' },
      { name: '工业检测', desc: '位置、速度与安全监测。' }
    ],
    advantages: [
      { title: '非接触检测', desc: '磁角度传感器耐磨损、寿命长。' },
      { title: '集成度高', desc: '部分型号集成接口与校准。' },
      { title: '精度稳定', desc: '温补与线性度表现良好。' },
      { title: '封装多样', desc: '适配紧凑与工业安装。' }
    ],
    guideLink: { label: '如何选择英飞凌传感器？', url: '/support/guides/how-to-choose-infineon-mcu.html' },
    faeReview: { author: '李工（MCU/嵌入式 FAE，12 年）', text: '传感器选型先定量程与精度，再定接口和安装方式。磁角度方案要特别关注气隙、磁铁尺寸与温漂，很多现场问题其实来自机械安装而不是芯片本身。' },
    alternatives: [{ model: 'TLE4998', url: '/products/sensors/tle4998.html' }, { model: 'DPS310', url: '/products/sensors/dps310.html' }],
    companions: [{ model: 'XMC1302', url: '/products/mcu/xmc1302.html' }, { model: 'BSC0902NSI', url: '/products/mosfet/bsc0902nsi.html' }],
    faq: [
      faq('英飞凌传感器有哪些类型？', ['常见类型包括磁角度传感器、霍尔线性传感器、电流传感器、压力传感器与飞行时间传感器。', '磁类适合位置/转速，电流类适合逆变与电源保护，压力类适合环境与流体监测，选型先明确被测量与安装方式。'], '按应用场景筛选表格，或让 FAE 推荐类型。'),
      faq('磁角度传感器与霍尔传感器如何选择？', ['磁角度传感器输出连续角度，适合转子位置与伺服控制；霍尔开关/线性传感器更适合限位、转速或简单位置检测。', '角度应用还要关注分辨率、线性度、气隙与磁铁布置。'], '查看磁角度型号，或提交机械结构由 FAE 评估。'),
      faq('表格中的参数列如何筛选？', ['表格支持按类型、量程/分辨率与封装筛选，点击表头排序；关键字可搜索型号。', '建议先按被测量与量程筛选，再比较接口、精度与封装。'], '筛选后点击型号查看详情与替代料。'),
      faq('压力传感器的量程与精度如何确定？', ['量程要覆盖工作范围并留有余量，精度要结合分辨率、温漂与长期稳定性评估。', '户外或流体应用还要考虑防护、介质兼容与封装安装方式。'], '提供工作范围与环境条件，由 FAE 协助选型。'),
      faq('封装与安装有哪些注意事项？', ['磁传感器要注意气隙、磁铁尺寸与同轴度；压力传感器要注意开孔、密封与应力；电流传感器要注意母排布局与绝缘。', '建议在结构设计早期引入传感器规格书，避免后期返工。'], '索取封装尺寸与应用笔记，或让 FAE 复核安装设计。'),
      faq('电流传感器的量程如何匹配？', ['量程要覆盖额定电流与过流/短路峰值，并留有一定裕量；同时关注带宽、隔离与温漂。', '逆变与电源应用还要考虑母排布局对磁场分布的影响。'], '提供额定/峰值电流与拓扑，由 FAE 推荐量程。'),
      faq('传感器替代料号如何选择？', ['优先匹配被测量、量程、接口、精度与封装，并核对供电与输出格式。', '替代后要重新校准与验证温漂，不能只看型号相近。'], '提交原型号与安装条件，FAE 给出替代清单。'),
      faq('如何获取传感器样品与报价？', ['通过联系我们提交型号、数量与项目阶段，销售会回复报价与样品政策。', '技术问题会转交 FAE，便于确认接口与校准方案。'], '前往联系我们提交询价或样品申请。')
    ],
    models: [
      { model: 'TLE5012B', slug: 'tle5012b', series: 'GMR 角度传感器', depth: 'deep', params: { '类型': '磁角度', '分辨率': '15 bit', '接口': 'SPI/IIF', '温度': '-40~125℃' }, package: 'PG-DSO-8', stock: 'in-stock', shortDesc: '15bit GMR 磁角度传感器，适合电机转子位置。', applications: ['BLDC 电机', '伺服控制', '转向角检测'], alternatives: ['TLE5501', 'TLE4998'], companions: ['XMC1302', 'BSC0902NSI'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '选型指南', url: '/support/guides/how-to-choose-infineon-mcu.html' }], images: ['assets/img/product-sensor.svg'] },
      { model: 'DPS368', slug: 'dps368', series: 'DPS3xx', depth: 'deep', params: { '类型': '压力', '量程': '300~1200 hPa', '接口': 'I2C/SPI', '温度': '-40~85℃' }, package: 'LGA-8', stock: 'in-stock', shortDesc: '高精度数字压力传感器，适合环境与高度检测。', applications: ['环境监测', '高度计', '穿戴设备'], alternatives: ['DPS310'], companions: ['XMC1302', 'CY8C5888'], documents: [{ label: '索取数据手册', url: '/contact/' }, { label: '应用笔记', url: '/support/app-notes/igbt-gate-driver-design.html' }], images: ['assets/img/product-sensor.svg'] },
      { model: 'TLE4998', slug: 'tle4998', series: '霍尔线性', depth: 'standard', params: { '类型': '霍尔线性', '量程': '±50 mT', '接口': '模拟/PWM', '温度': '-40~150℃' }, package: 'PG-SSO-3', stock: 'in-stock', shortDesc: '霍尔线性传感器，适合位置与角度检测。', applications: ['位置检测', '油门踏板', '工业控制'], alternatives: ['TLE5012B'], companions: ['XMC1302'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-sensor.svg'] },
      { model: 'DPS310', slug: 'dps310', series: 'DPS3xx', depth: 'standard', params: { '类型': '压力', '量程': '300~1200 hPa', '接口': 'I2C/SPI', '温度': '-40~85℃' }, package: 'LGA-8', stock: 'in-stock', shortDesc: '数字压力传感器，适合消费与工业环境监测。', applications: ['环境监测', '穿戴设备', '家电'], alternatives: ['DPS368'], companions: ['CY8C5888'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-sensor.svg'] },
      { model: 'TLI4971', slug: 'tli4971', series: '电流传感器', depth: 'standard', params: { '类型': '电流', '量程': '±50 A', '接口': '模拟', '温度': '-40~125℃' }, package: 'PG-DSO-8', stock: 'inquiry', shortDesc: '无磁芯电流传感器，适合逆变与电源监测。', applications: ['逆变器', '电源监测', '电池保护'], alternatives: ['TLE4998'], companions: ['XMC4800', 'FF450R12ME4'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-sensor.svg'] },
      { model: 'TLE5501', slug: 'tle5501', series: 'TMR 角度传感器', depth: 'standard', params: { '类型': '磁角度', '分辨率': '12 bit', '接口': '模拟', '温度': '-40~125℃' }, package: 'TSSOP-16', stock: 'in-stock', shortDesc: 'TMR 角度传感器，适合高精度位置检测。', applications: ['电机位置', '转向角', '工业检测'], alternatives: ['TLE5012B'], companions: ['XMC1302'], documents: [{ label: '索取数据手册', url: '/contact/' }], images: ['assets/img/product-sensor.svg'] }
    ]
  }
];

const output = {
  brand,
  page: {
    id: 'products-list',
    type: 'products-list',
    seo: {
      title: '英飞凌产品中心_全系列型号选型-力通英飞凌代理',
      description: '力通英飞凌产品中心，覆盖 MCU 微控制器、IGBT、MOSFET 与传感器四大分类，提供型号参数表、应用领域、优势对比与选型支持。',
      keywords: ['英飞凌产品中心', '英飞凌MCU代理', '英飞凌IGBT代理', '英飞凌MOSFET代理', '英飞凌传感器代理'],
      canonical: '/products/'
    },
    breadcrumbs: [{ name: '首页', url: '/' }, { name: '产品中心', url: '/products/' }],
    content: {
      intro: '力通英飞凌产品中心按 MCU 微控制器、IGBT 功率器件、MOSFET 与传感器四大分类组织，提供型号参数表、应用领域、优势对比、替代料与配套料号，帮助工程师快速完成选型。',
      categories: cats.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, description: c.description, count: c.models.length, url: `/products/${c.slug}/` }))
    },
    faq: [
      faq('英飞凌产品中心包含哪些分类？', ['产品中心覆盖 MCU 微控制器、IGBT 功率器件、MOSFET 与传感器四大分类，每个分类都有型号参数表与应用领域说明。', '可先按分类进入，再在表格中按参数筛选，点击型号查看详情。'], '从分类卡片进入对应型号表格。'),
      faq('如何快速找到需要的型号？', ['进入二级分类页后，可用关键字搜索型号/系列/封装，或点击参数列表头排序，再结合筛选条件缩小范围。', '若不确定参数，可提交项目需求由 FAE 协助选型。'], '使用分类页表格筛选，或联系 FAE。'),
      faq('产品参数以哪个版本为准？', ['页面参数用于选型参考，最终以英飞凌最新数据手册与批次标签为准。', '涉及认证、温度等级或容差要求时，请在询价时注明。'], '索取最新规格书或联系销售核验。')
    ]
  },
  categories: cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    description: c.description,
    applications: c.applications,
    advantages: c.advantages,
    guideLink: c.guideLink,
    faeReview: c.faeReview,
    alternatives: c.alternatives,
    companions: c.companions,
    faq: catFaq(c),
    models: c.models.map((m) => ({
      ...m,
      description: m.depth === 'deep' ? deepDesc(m, c) : stdDesc(m, c),
      faq: modelFaq(m, c, m.depth === 'deep' ? 5 : 3)
    }))
  }))
};

await writeFile(outFile, JSON.stringify(output, null, 2) + '\n', 'utf8');

const deep = output.categories.flatMap((c) => c.models).filter((m) => m.depth === 'deep').length;
const standard = output.categories.flatMap((c) => c.models).filter((m) => m.depth === 'standard').length;
console.log(`[seed-products] categories=${output.categories.length} models=${deep + standard} deep=${deep} standard=${standard}`);
console.log(`[seed-products] written ${outFile}`);
