export type SanitizeResult = { clean: string; flagged: boolean };

/**
 * 常见中文/英文辱骂及变体（大小写/符号夹杂）
 * 说明：
 * - 使用 \W* 允许在字符间插入符号（如 n-m s_l）
 * - 仅覆盖高频词，后续可扩展至远程词表
 */
const BAD_PATTERNS: RegExp[] = [
  // 英文缩写与变体
  /n\W*m\W*s\W*l/gi,              // nmsl
  /c\W*n\W*m/gi,                  // cnm
  /\bsh\W*a\W*b\W*i\b/gi,         // shabi
  /\bs\W*b\b/gi,                  // sb
  // 常见中文脏话与口语
  /(傻逼|煞笔|沙雕|傻b)/gi,
  /(妈的|馬的|他妈|他媽|妈逼|妈比)/gi,
  /(操你妈|操你|草你|艹|日你)/gi,
  /(弱智|智障|脑残|廢物|废物)/gi,
  /(婊子|贱人|贱|骚货)/gi,
  /(狗逼|狗比)/gi,
  /(滚蛋|滚开|去死)/gi
];

/**
 * 将命中的不良词替换为等长星号
 */
export function sanitizeText(text: string): SanitizeResult {
  let clean = text ?? '';
  let flagged = false;
  for (const re of BAD_PATTERNS) {
    clean = clean.replace(re, (m) => {
      flagged = true;
      // 保留字符串长度的星号，避免破坏排版
      return '*'.repeat(m.length);
    });
  }
  return { clean, flagged };
}

/**
 * 仅检测是否包含不良词
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return BAD_PATTERNS.some((re) => re.test(text));
}

/**
 * 一个可扩展的接口：合并远程词表
 * 实际项目可从后端/存储拉取词表并追加到 BAD_PATTERNS
 */
export function extendBadPatterns(patterns: (string | RegExp)[]) {
  for (const p of patterns) {
    if (p instanceof RegExp) {
      BAD_PATTERNS.push(p);
    } else {
      BAD_PATTERNS.push(new RegExp(p, 'gi'));
    }
  }
}