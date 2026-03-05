export type SpecSectionKey =
  | 'deviceType'
  | 'lightSource'
  | 'opticsPhotometry'
  | 'colorMixing'
  | 'goboFraming'
  | 'effects'
  | 'movement'
  | 'controlConnections'
  | 'softwareInterface'
  | 'electricalPower'
  | 'thermalNoiseEnvironment'
  | 'safety'
  | 'compliance'
  | 'housingMountingWorkingPosition'
  | 'dimensionsWeight'
  | 'packagingAccessories'
  | 'misc'

export type FlatSpecItem = {
  label?: string | null
  value?: string | null
  group?: string | null
}

export type GroupedSpecSection = {
  key: SpecSectionKey
  titleRu: string
  items: {
    label: string
    value?: string
  }[]
}

type SectionDefinition = {
  key: SpecSectionKey
  titleRu: string
  priority: number
  labelMatchers: RegExp[]
  valueMatchers: RegExp[]
  strongMatchers: RegExp[]
  hintMatchers: RegExp[]
}

const makeRegexes = (tokens: string[]): RegExp[] =>
  tokens.map((token) => new RegExp(token, 'i'))

const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    key: 'deviceType',
    titleRu: 'Тип прибора / устройства',
    priority: 121,
    labelMatchers: makeRegexes([
      '^тип$',
      '^тип прибора$',
      '^тип устройства$',
      'fixture type',
      'device type',
      'назначение',
    ]),
    valueMatchers: makeRegexes([
      '\\bpar\\b',
      '\\bspot\\b',
      '\\bwash\\b',
      '\\bbeam\\b',
      'moving head',
      'profile',
      'follow ?spot',
      'blinder',
      'strobe',
      'laser',
      'дым',
      'fog',
      'hazer',
    ]),
    strongMatchers: makeRegexes(['\\bpar\\b', '\\bspot\\b', '\\bwash\\b', '\\bbeam\\b']),
    hintMatchers: makeRegexes(['тип прибора', 'тип устройства', 'fixture type', 'device type']),
  },
  {
    key: 'lightSource',
    titleRu: 'Источник света',
    priority: 120,
    labelMatchers: makeRegexes([
      'источник света',
      'тип источника света',
      'срок службы',
      'цветовая температура',
      'ламп',
      '\\bhri\\b',
      '\\bmsd\\b',
      '\\bled\\b',
      'светодиод',
      '\\bcob\\b',
      'light source',
      'arc lamp',
      'lifespan',
    ]),
    valueMatchers: makeRegexes(['\\bled\\b', '\\bhri\\b', 'arc lamp', 'life']),
    strongMatchers: makeRegexes(['\\bled\\b']),
    hintMatchers: makeRegexes(['light source type', 'источник света']),
  },
  {
    key: 'opticsPhotometry',
    titleRu: 'Оптика и фотометрия',
    priority: 115,
    labelMatchers: makeRegexes([
      'оптик',
      'линз',
      'диаметр передней линзы',
      'зум',
      '\\bzoom\\b',
      'beam angle',
      'field angle',
      'фокус',
      'illuminance',
      'освещ',
      'люкс',
      'люмен',
      'фотометр',
      'photometric',
      'photometric data',
      'photometrics',
      'lumen output',
      'световой поток',
    ]),
    valueMatchers: makeRegexes(['\\blux\\b', '\\blm\\b', 'люкс', 'люмен', '\\bzoom\\b']),
    strongMatchers: makeRegexes(['\\blux\\b', '\\blm\\b']),
    hintMatchers: makeRegexes(['photometric', 'optical', 'оптика', 'фотометр']),
  },
  {
    key: 'colorMixing',
    titleRu: 'Цвет / смешение',
    priority: 110,
    labelMatchers: makeRegexes([
      'цвет',
      'колесо цвета',
      'линейное смешение',
      '\\bcmy\\b',
      '\\bcto\\b',
      '\\bctb\\b',
      'cri',
      'кельвин',
      'color wheel',
      'color temperature',
      'high-?cri',
    ]),
    valueMatchers: makeRegexes(['\\bcmy\\b', '\\bcto\\b', '\\bctb\\b', 'cri', '\\bk\\b']),
    strongMatchers: makeRegexes(['\\bcmy\\b', '\\bcto\\b']),
    hintMatchers: makeRegexes(['\\bcolor\\b', 'цвет', 'цвета']),
  },
  {
    key: 'goboFraming',
    titleRu: 'Гобо / фрейминг',
    priority: 109,
    labelMatchers: makeRegexes([
      'гобо',
      'колесо гобо',
      'вращающ',
      'статич',
      'внешний диаметр',
      'диаметр изображения',
      'толщин',
      'rotating gobo',
      'static gobo',
      'framing',
      'blade',
      'шторк',
      'нож',
    ]),
    valueMatchers: makeRegexes(['gobo', 'framing', 'blade']),
    strongMatchers: makeRegexes(['gobo', 'framing']),
    hintMatchers: makeRegexes(['\\bgobo\\b', 'framing', 'гобо']),
  },
  {
    key: 'effects',
    titleRu: 'Эффекты',
    priority: 108,
    labelMatchers: makeRegexes([
      'призма',
      'frost',
      'фрост',
      'ирис',
      'animation wheel',
      'строб',
      'shutter',
      'диммер',
      'крив',
      '\\bpwm\\b',
      'refresh',
      'шаттер',
      'луч',
      'macro',
      'эффект',
      'анимационное колесо',
    ]),
    valueMatchers: makeRegexes(['prism', 'frost', 'iris', 'strobe', 'dimmer', 'pwm', 'refresh']),
    strongMatchers: makeRegexes(['prism', 'frost', 'iris', '\\bpwm\\b']),
    hintMatchers: makeRegexes(['dynamic effects', 'effects', 'эффект', 'эффекты']),
  },
  {
    key: 'movement',
    titleRu: 'Движение',
    priority: 107,
    labelMatchers: makeRegexes([
      '\\bpan\\b',
      '\\btilt\\b',
      'поворот',
      'наклон',
      'angle of motion',
      '16bit',
      '16 bit',
      'точност',
      'сброс',
      'reset',
      'lock',
      'reposition',
      'reset correction',
    ]),
    valueMatchers: makeRegexes(['\\bpan\\b', '\\btilt\\b', '16bit', 'lock']),
    strongMatchers: makeRegexes(['\\bpan\\b', '\\btilt\\b']),
    hintMatchers: makeRegexes(['movement', '\\bpan\\b', '\\btilt\\b', 'движени']),
  },
  {
    key: 'controlConnections',
    titleRu: 'Управление и подключения',
    priority: 106,
    labelMatchers: makeRegexes([
      'управлен',
      'протокол',
      'канал',
      'режимы',
      'персоналити',
      '\\bdmx\\b',
      'art-?net',
      '\\bsacn\\b',
      '\\brdm\\b',
      '\\bxlr\\b',
      '\\brj45\\b',
      'ethernet',
      'подключение данных',
      'разъем',
      'разъ[её]м',
      'master-?slave',
      'control',
      'connection',
      'personalit',
    ]),
    valueMatchers: makeRegexes(['\\bdmx\\b', 'art-?net', '\\bsacn\\b', '\\brdm\\b', '\\bxlr\\b', '\\brj45\\b']),
    strongMatchers: makeRegexes(['\\bdmx\\b', 'art-?net', '\\bsacn\\b', '\\brdm\\b']),
    hintMatchers: makeRegexes([
      'control and connections',
      'control',
      'connection',
      'управлен',
      'управление и подключения',
    ]),
  },
  {
    key: 'softwareInterface',
    titleRu: 'ПО / функции / интерфейс',
    priority: 105,
    labelMatchers: makeRegexes([
      'прошив',
      'firmware',
      'web server',
      'веб-сервер',
      'диагност',
      'монитор',
      'cloudio',
      'батаре',
      'диспле',
      '\\blcd\\b',
      'menu language',
      'usb upgrade',
      'software',
      'аппаратная часть',
      'интерфейс',
    ]),
    valueMatchers: makeRegexes(['firmware', 'web server', 'diagnostic', '\\blcd\\b', 'usb', 'cloudio']),
    strongMatchers: makeRegexes(['firmware', 'web server', '\\blcd\\b', 'cloudio']),
    hintMatchers: makeRegexes([
      'hardware and software',
      'software',
      'интерфейс',
      'аппаратная часть и по',
      '^по$',
    ]),
  },
  {
    key: 'electricalPower',
    titleRu: 'Электрика / питание',
    priority: 104,
    labelMatchers: makeRegexes([
      'питани',
      'электропитание',
      'напряж',
      'частот',
      'power',
      'electrical',
      'consumption',
      'макс. ток',
      'максимальн.*ток',
      'максимальн.*потребля',
      'current',
      '\\bpf\\b',
      'powercon',
      'true1',
      'pfc',
      'voltage',
    ]),
    valueMatchers: makeRegexes([
      '\\b\\d{2,3}\\s*[-~]\\s*\\d{2,3}\\s*v\\b',
      '\\b50\\s*[\\/]\\s*60\\s*hz\\b',
      '\\b\\d+(?:[\\.,]\\d+)?\\s*(w|va|a|v|hz)\\b',
      '\\bpf\\b',
    ]),
    strongMatchers: makeRegexes([
      '\\b\\d{2,3}\\s*[-~]\\s*\\d{2,3}\\s*v\\b',
      '\\b50\\s*[\\/]\\s*60\\s*hz\\b',
      '\\b\\d+(?:[\\.,]\\d+)?\\s*(w|va|a)\\b',
    ]),
    hintMatchers: makeRegexes(['electrical', 'power', 'питани', 'электр', 'электропитание']),
  },
  {
    key: 'thermalNoiseEnvironment',
    titleRu: 'Термо / шум / окружение',
    priority: 103,
    labelMatchers: makeRegexes([
      'temperature',
      'температур',
      'ambient',
      'surface temp',
      'охлажден',
      'вентил',
      'noise',
      'шум',
      'уровень шума',
      'dba',
      'silent mode',
      'working environment',
      'рабочая среда',
      'тепловыделен',
      'thermal',
    ]),
    valueMatchers: makeRegexes(['dba', 'ambient', 'temp', 'fan', 'silent', 'btu']),
    strongMatchers: makeRegexes(['dba', 'ambient', 'thermal', 'btu']),
    hintMatchers: makeRegexes([
      'thermal specification',
      'noise level',
      'термо',
      'шум',
      'тепловые характеристики',
      'уровень шума',
    ]),
  },
  {
    key: 'safety',
    titleRu: 'Безопасность',
    priority: 102,
    labelMatchers: makeRegexes([
      'предохран',
      '\\bfuse\\b',
      'дистанц',
      'термозащит',
      'minimum distance',
      'flammable',
      'thermally protected',
      'safety',
      'безопас',
    ]),
    valueMatchers: makeRegexes(['\\bfuse\\b', 'distance', 'flammable', 'safety']),
    strongMatchers: makeRegexes(['\\bfuse\\b', 'minimum distance', 'flammable']),
    hintMatchers: makeRegexes(['safety specs', 'безопас', 'требования безопасности']),
  },
  {
    key: 'compliance',
    titleRu: 'Соответствие / сертификация',
    priority: 101,
    labelMatchers: makeRegexes([
      'соответств',
      'сертиф',
      'маркировка',
      'compliance',
      '\\d{4}\\s*\\/\\s*\\d+\\s*\\/(eu|ec)',
      '\\bce\\b',
      'ukca',
      'rohs',
      'emc',
      'lvd',
      '\\beac\\b',
      'cetlus',
      'cmetus',
      'listed',
    ]),
    valueMatchers: makeRegexes([
      '\\bce\\b',
      'ukca',
      'rohs',
      'emc',
      'lvd',
      '\\beac\\b',
      '\\d{4}\\s*\\/\\s*\\d+\\s*\\/(eu|ec)',
      'cetlus',
      'cmetus',
      'listed',
    ]),
    strongMatchers: makeRegexes(['\\bce\\b', 'ukca', 'rohs', '\\beac\\b', 'cetlus', 'cmetus']),
    hintMatchers: makeRegexes(['compliance', 'соответств', 'соответствие нормам']),
  },
  {
    key: 'housingMountingWorkingPosition',
    titleRu: 'Корпус / монтаж / рабочее положение',
    priority: 100,
    labelMatchers: makeRegexes([
      'корпус',
      'конструкц',
      'material',
      'материал',
      'ручк',
      '\\bip\\d{2}\\b',
      'защита',
      'подвес',
      'страховоч',
      'omega',
      'clamp',
      'working position',
      'hanging',
      'работа в любом положении',
      'rigging',
      'mount',
      'position',
    ]),
    valueMatchers: makeRegexes(['\\bip\\d{2}\\b', 'omega', 'clamp', 'hanging']),
    strongMatchers: makeRegexes(['\\bip\\d{2}\\b']),
    hintMatchers: makeRegexes(['housing', 'working position', 'монтаж', 'корпус']),
  },
  {
    key: 'dimensionsWeight',
    titleRu: 'Габариты и вес',
    priority: 99,
    labelMatchers: makeRegexes([
      'габарит',
      'размер',
      'высота',
      'distance between',
      'расстояние между',
      'weight',
      'вес',
      'size',
      'dimension',
      'base dimension',
      'size & weight',
    ]),
    valueMatchers: makeRegexes([
      '\\b\\d+(?:[\\.,]\\d+)?\\s*[xх×]\\s*\\d+(?:[\\.,]\\d+)?\\s*[xх×]\\s*\\d+(?:[\\.,]\\d+)?\\s*mm\\b',
      '\\b\\d+(?:[\\.,]\\d+)?\\s*(kg|кг)\\b',
    ]),
    strongMatchers: makeRegexes([
      '\\b\\d+(?:[\\.,]\\d+)?\\s*[xх×]\\s*\\d+(?:[\\.,]\\d+)?\\s*[xх×]\\s*\\d+(?:[\\.,]\\d+)?\\s*mm\\b',
      '\\b\\d+(?:[\\.,]\\d+)?\\s*(kg|кг)\\b',
    ]),
    hintMatchers: makeRegexes([
      'weight - size',
      'size & weight',
      'габарит',
      'вес',
      'вес и габариты',
    ]),
  },
  {
    key: 'packagingAccessories',
    titleRu: 'Упаковка / комплектация / аксессуары',
    priority: 98,
    labelMatchers: makeRegexes([
      'упаков',
      'carton',
      'коробк',
      'флайт',
      'кейс',
      'оболочк',
      'flight ?case',
      'flycase',
      'foam shell',
      'аксессуар',
      'accessor',
      'модул',
      'омега-скоб',
      'кабель питания',
      'clamps included',
    ]),
    valueMatchers: makeRegexes(['carton', 'flight', 'flycase', 'аксессуар', 'опци', 'option']),
    strongMatchers: makeRegexes(['flycase', 'flight case']),
    hintMatchers: makeRegexes(['packaging', 'accessories', 'упаков', 'аксессуар', 'аксессуары']),
  },
  {
    key: 'misc',
    titleRu: 'Прочее',
    priority: 1,
    labelMatchers: [],
    valueMatchers: [],
    strongMatchers: [],
    hintMatchers: makeRegexes(['прочее', 'other', 'others']),
  },
]

export const SPEC_SECTION_OPTIONS: Array<{ label: string; value: SpecSectionKey }> =
  SECTION_DEFINITIONS.map((section) => ({
    label: section.titleRu,
    value: section.key,
  }))

const SECTION_HINT_ALIASES: Array<{ matcher: RegExp; key: SpecSectionKey }> = SECTION_DEFINITIONS
  .filter((section) => section.key !== 'misc')
  .flatMap((section) => section.hintMatchers.map((matcher) => ({ matcher, key: section.key })))

const KNOWN_KEYS = new Set<SpecSectionKey>(SECTION_DEFINITIONS.map((section) => section.key))

const STRONG_MARKERS: Array<{ matcher: RegExp; keys: SpecSectionKey[] }> = [
  { matcher: /\b(par|spot|wash|beam|profile|moving head)\b/i, keys: ['deviceType'] },
  { matcher: /\bdmx\b|art-?net|\bsacn\b|\brdm\b/i, keys: ['controlConnections'] },
  { matcher: /\bip\d{2}\b/i, keys: ['housingMountingWorkingPosition'] },
  { matcher: /\b\d{2,3}\s*[-~]\s*\d{2,3}\s*v\b/i, keys: ['electricalPower'] },
  { matcher: /\b50\s*[\/]\s*60\s*hz\b/i, keys: ['electricalPower'] },
  { matcher: /\blm\b|люмен/i, keys: ['opticsPhotometry'] },
  { matcher: /\blux\b|люкс/i, keys: ['opticsPhotometry'] },
  { matcher: /\bcri\b/i, keys: ['colorMixing'] },
  { matcher: /\b(rgbwa|rgbaw|rgbw|rgb|cmy|cto|ctb)\b/i, keys: ['colorMixing'] },
  { matcher: /\bpan\b|\btilt\b/i, keys: ['movement'] },
  { matcher: /gobo|framing/i, keys: ['goboFraming'] },
  { matcher: /prism|frost|iris/i, keys: ['effects'] },
  { matcher: /cloudio|firmware|web server|lcd|diagnostic/i, keys: ['softwareInterface'] },
  { matcher: /carton|flycase|flight case|foam shell|коробк|флайт|оболочк|аксессуар/i, keys: ['packagingAccessories'] },
  { matcher: /рабочая среда|ambient|btu|тепловыделени/i, keys: ['thermalNoiseEnvironment'] },
]

const normalizeRawText = (value: unknown): string => {
  if (typeof value !== 'string') return ''

  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[“”"']/g, ' ')
    .replace(/[|•·]/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalizeUnits = (value: string): string =>
  value
    .replace(/(\d)\s*мм\b/g, '$1 mm')
    .replace(/(\d)\s*кг\b/g, '$1 kg')
    .replace(/(\d)\s*вт\b/g, '$1 w')
    .replace(/(\d)\s*ва\b/g, '$1 va')
    .replace(/(\d)\s*гц\b/g, '$1 hz')
    .replace(/(\d)\s*лк\b/g, '$1 lux')
    .replace(/(\d)\s*лм\b/g, '$1 lm')
    .replace(/×/g, 'x')
    .replace(/(\d)\s*х\s*(\d)/g, '$1 x $2')

const normalizeText = (value: unknown): string => normalizeUnits(normalizeRawText(value))

const matchAny = (text: string, patterns: RegExp[]): boolean => patterns.some((pattern) => pattern.test(text))

const hasStrongMarker = (text: string, sectionKey: SpecSectionKey): boolean =>
  STRONG_MARKERS.some((marker) => marker.keys.includes(sectionKey) && marker.matcher.test(text))

const detectHintSection = (label: string): SpecSectionKey | null => {
  for (const hint of SECTION_HINT_ALIASES) {
    if (hint.matcher.test(label)) return hint.key
  }
  return null
}

export const detectSpecificationSectionHint = (rawText: string): SpecSectionKey | null => {
  const normalized = normalizeText(rawText)
  if (!normalized) return null

  const key = detectHintSection(normalized)
  if (!key || key === 'misc') return null
  return key
}

const toFlatItem = (item: FlatSpecItem): { label: string; value: string; group?: SpecSectionKey } => {
  let label = String(item?.label ?? '').trim()
  let value = String(item?.value ?? '').trim()
  const groupRaw = String(item?.group ?? '').trim()
  const group = KNOWN_KEYS.has(groupRaw as SpecSectionKey) ? (groupRaw as SpecSectionKey) : undefined

  if (!label && value) {
    const match = value.match(/^([^:]{2,120}):\s*(.+)$/)
    if (match) {
      label = match[1].trim()
      value = match[2].trim()
    }
  }

  if (label.startsWith('•')) {
    label = label.replace(/^•+\s*/, '').trim()
  }

  if (value.startsWith('•')) {
    value = value.replace(/^•+\s*/, '').trim()
  }

  return { label, value, group }
}

const isSectionHintLine = (item: { label: string; value: string }): boolean => {
  if (!item.label || item.value) return false
  return Boolean(detectHintSection(normalizeText(item.label)))
}

const scoreForSection = (
  section: SectionDefinition,
  label: string,
  value: string,
  combined: string,
  hintKey: SpecSectionKey | null,
): number => {
  let score = 0

  if (matchAny(label, section.labelMatchers)) score += 6
  if (!label && matchAny(combined, section.labelMatchers)) score += 6
  if (value && matchAny(value, section.valueMatchers)) score += 3
  if (hasStrongMarker(combined, section.key)) score += 2
  if (hintKey && hintKey === section.key) score += 4

  if (score > 0) {
    score += section.priority / 1000
  }

  return score
}

const resolveConflict = (
  combined: string,
  baseWinner: SpecSectionKey,
  scoreMap: Map<SpecSectionKey, number>,
): SpecSectionKey => {
  if (/\bтип( прибора| устройства)?\b|\bfixture type\b|\bdevice type\b/.test(combined)) {
    if (/\b(par|spot|wash|beam|profile|moving head|blinder|strobe|laser)\b/.test(combined)) {
      return 'deviceType'
    }
  }
  if (/\b(rgbwa|rgbaw|rgbw|rgb|cmy|cto|ctb|color mixing|цветосмеш)\b/.test(combined)) {
    return 'colorMixing'
  }

  if (/тип источника света|light source|arc lamp|hri|msd/i.test(combined)) {
    return 'lightSource'
  }

  const hasSize = /\b\d+(?:[\.,]\d+)?\s*x\s*\d+(?:[\.,]\d+)?\s*x\s*\d+(?:[\.,]\d+)?\s*mm\b/i.test(
    combined,
  )
  const hasElectrical = /\b(v|hz|a|w|va|pf|current|voltage|power)\b/i.test(combined)

  if (
    (baseWinner === 'dimensionsWeight' || baseWinner === 'electricalPower') &&
    scoreMap.has('dimensionsWeight') &&
    scoreMap.has('electricalPower')
  ) {
    if (hasSize) return 'dimensionsWeight'
    if (hasElectrical) return 'electricalPower'
  }

  if (/cloudio|firmware|web server|diagnostic|lcd|usb/i.test(combined)) {
    return 'softwareInterface'
  }
  if (
    /картон|коробк|флайт|flight|flycase|foam shell|оболочк|аксессуар|опци|в комплекте|included|optional/i.test(
      combined,
    )
  ) {
    return 'packagingAccessories'
  }
  if (/световой поток|lumen output|\blm\b|люмен/i.test(combined)) return 'opticsPhotometry'
  if (/внешний диаметр|диаметр изображения|толщин/i.test(combined)) return 'goboFraming'
  if (/анимационн|призма|frost|фрост|ирис|строб|диммер|шаттер/i.test(combined)) return 'effects'
  if (/точност|reset|сброс|reposition|pan|tilt|16 ?bit/i.test(combined)) return 'movement'
  if (/подключение данных|xlr|rj45|ethernet|dmx|art-?net|sacn|rdm/i.test(combined)) {
    return 'controlConnections'
  }
  if (
    /макс\.?\s*ток|current|потребля|voltage|напряж|электропит/i.test(combined) ||
    /\b\d+(?:[\.,]\d+)?\s*(w|va|a|v|hz)\b/i.test(combined)
  ) {
    return 'electricalPower'
  }
  if (/рабочая среда|ambient|температур|dba|тепловыделен|btu/i.test(combined)) {
    return 'thermalNoiseEnvironment'
  }
  if (/работа в любом положении|working position|hanging|omega|clamp|ip\d{2}/i.test(combined)) {
    return 'housingMountingWorkingPosition'
  }
  if (/\d{4}\s*\/\s*\d+\s*\/(eu|ec)|cetlus|cmetus|listed|ukca|ce|rohs|emc|lvd|eac/i.test(combined)) {
    return 'compliance'
  }

  if (/\bip\d{2}\b/i.test(combined)) return 'housingMountingWorkingPosition'
  if (/working environment|ambient|surface temp|noise|dba|fan|silent|thermal/i.test(combined)) {
    return 'thermalNoiseEnvironment'
  }
  if (/fuse|minimum distance|flammable|thermally protected|safety/i.test(combined)) return 'safety'
  if (/\b(ce|ukca|rohs|emc|lvd|eac)\b/i.test(combined)) return 'compliance'
  if (/\bpan\b|\btilt\b|angle of motion|16bit|lock|reposition|reset correction/i.test(combined)) {
    return 'movement'
  }
  if (/\bdmx\b|art-?net|\bsacn\b|\brdm\b|\bxlr\b|\brj45\b|protocol|channels|personalit/i.test(combined)) {
    return 'controlConnections'
  }
  if (/firmware|web server|diagnostic|display|lcd|menu language|usb/i.test(combined)) {
    return 'softwareInterface'
  }
  if (/\bcmy\b|\bcto\b|color wheel|color temperature|cri filter/i.test(combined)) {
    return 'colorMixing'
  }
  if (/gobo|framing|blade/i.test(combined)) return 'goboFraming'
  if (/prism|frost|iris|animation wheel|strobe|dimmer|pwm|refresh/i.test(combined)) {
    return 'effects'
  }

  return baseWinner
}

const classifySection = (
  item: { label: string; value: string; group?: SpecSectionKey },
  hintKey: SpecSectionKey | null,
  minScore = 3,
): SpecSectionKey => {
  if (item.group && item.group !== 'misc') return item.group

  const label = normalizeText(item.label)
  const value = normalizeText(item.value)
  const combined = `${label} ${value}`.trim()

  let bestKey: SpecSectionKey = 'misc'
  let bestScore = -Infinity
  const scoreMap = new Map<SpecSectionKey, number>()

  for (const section of SECTION_DEFINITIONS) {
    if (section.key === 'misc') continue
    const score = scoreForSection(section, label, value, combined, hintKey)
    scoreMap.set(section.key, score)
    if (score > bestScore) {
      bestScore = score
      bestKey = section.key
    }
  }

  if (bestScore < minScore) return 'misc'
  return resolveConflict(combined, bestKey, scoreMap)
}

export const groupSpecificationItems = (
  items: FlatSpecItem[],
  options?: { hintWindow?: number; minScore?: number },
): GroupedSpecSection[] => {
  const hintWindow = options?.hintWindow ?? 10
  const minScore = options?.minScore ?? 3

  let activeHint: { key: SpecSectionKey; left: number } | null = null

  const buckets = new Map<SpecSectionKey, { label: string; value?: string }[]>()

  for (const rawItem of items) {
    const item = toFlatItem(rawItem)
    if (!item.label && !item.value) continue

    const normalizedLabel = normalizeText(item.label)
    const hint = detectHintSection(normalizedLabel)

    if (hint && isSectionHintLine(item)) {
      activeHint = { key: hint, left: hintWindow }
      continue
    }

    const hintKey = activeHint?.left ? activeHint.key : null
    const sectionKey = classifySection(item, hintKey, minScore)
    if (!buckets.has(sectionKey)) buckets.set(sectionKey, [])
    buckets.get(sectionKey)?.push({
      label: item.label,
      ...(item.value ? { value: item.value } : {}),
    })

    if (activeHint?.left) {
      activeHint.left -= 1
      if (activeHint.left <= 0) activeHint = null
    }
  }

  return SECTION_DEFINITIONS.filter((section) => (buckets.get(section.key) || []).length > 0).map(
    (section) => ({
      key: section.key,
      titleRu: section.titleRu,
      items: buckets.get(section.key) || [],
    }),
  )
}

export const classifySingleSpecification = (item: FlatSpecItem): SpecSectionKey => {
  const [section] = groupSpecificationItems([item])
  return section?.key || 'misc'
}
