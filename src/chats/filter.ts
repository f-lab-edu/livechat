export interface FilterResult {
  found: boolean;
  cleaned: string;
  matches: string[];
}

export interface FilterOptions {
  placeholder?: string; // 기본: '*'
  allow?: string[]; // 허용 단어 목록
  extra?: string[]; // 추가 필터 단어
}

// 기본 한국어 욕설 리스트 (샘플)
const KO_BADWORDS: string[] = ['씨발', '씨팔', '씨바', '시발', '시팔', '씹새끼', '개새끼', '병신', '좆', '닥쳐', '지랄', '꺼져'];

// 한글 경계 기준: 공백, 구두점, 특수문자
const WORD_SEP = /[\s.,!?;:()[\]{}"'`~<>\/\\|@#$%^&+=*-]/;

function wordBoundaryRegex(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|${WORD_SEP.source})(${escaped})(?=${WORD_SEP.source}|$)`, 'gi');
}

export function createKoProfanityFilter(opts: FilterOptions = {}) {
  const placeholder = opts.placeholder ?? '*';
  const allow = new Set((opts.allow ?? []).map((w) => w.toLowerCase()));
  const dict = Array.from(
    new Set(
      KO_BADWORDS.concat(opts.extra ?? [])
        .map((w) => w.trim())
        .filter(Boolean),
    ),
  ).filter((w) => !allow.has(w.toLowerCase()));

  const regexes = dict.map((w) => ({ re: wordBoundaryRegex(w), word: w }));

  function filter(text: string): FilterResult {
    if (!text) return { found: false, cleaned: text, matches: [] };
    let cleaned = text.normalize('NFKC');
    const matches: string[] = [];

    for (const { re, word } of regexes) {
      cleaned = cleaned.replace(re, (match, p1, p2) => {
        if (!p2) return match;
        matches.push(word);
        return `${p1}${placeholder.repeat(p2.length)}`;
      });
    }

    return { found: matches.length > 0, cleaned, matches };
  }

  return { filter, dict };
}
