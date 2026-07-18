import { Fragment, type ReactNode } from "react";

export type Lang = "html" | "jsx" | "json" | "bash" | "php";

/**
 * Tiny dependency-free syntax highlighter tuned for the small, curated code
 * snippets used across the installation docs. It is intentionally not a full
 * language parser — it tokenises the few constructs we actually show (tags,
 * attributes, strings, comments, keywords, punctuation) and wraps them in
 * theme-aware spans. Order of the rules matters: strings/comments are matched
 * first so their contents are never re-tokenised.
 */

type Rule = { re: RegExp; cls: string };

const C = {
  comment: "text-ink-500 italic",
  string: "text-emerald-300",
  tag: "text-[#8B8FF8]",
  attr: "text-[#C7CCFE]",
  keyword: "text-[#F0A9E4]",
  fn: "text-[#8B8FF8]",
  number: "text-amber-300",
  punct: "text-ink-400",
  key: "text-[#8B8FF8]",
  bool: "text-amber-300",
};

const RULES: Record<Lang, Rule[]> = {
  html: [
    { re: /<!--[\s\S]*?-->/y, cls: C.comment },
    { re: /"[^"]*"|'[^']*'/y, cls: C.string },
    { re: /<\/?[a-zA-Z][\w-]*/y, cls: C.tag },
    { re: /[a-zA-Z-]+(?==)/y, cls: C.attr },
    { re: /[<>/=]/y, cls: C.punct },
  ],
  php: [
    { re: /\/\/[^\n]*|#[^\n]*/y, cls: C.comment },
    { re: /"[^"]*"|'[^']*'/y, cls: C.string },
    { re: /<\?php|\?>/y, cls: C.keyword },
    { re: /<\/?[a-zA-Z][\w-]*/y, cls: C.tag },
    { re: /[a-zA-Z-]+(?==)/y, cls: C.attr },
    { re: /[<>/=]/y, cls: C.punct },
  ],
  jsx: [
    { re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y, cls: C.comment },
    { re: /`[^`]*`|"[^"]*"|'[^']*'/y, cls: C.string },
    {
      re: /\b(import|from|export|default|function|return|const|let|var|useEffect|new|if|else)\b/y,
      cls: C.keyword,
    },
    { re: /<\/?[A-Za-z][\w.]*/y, cls: C.tag },
    { re: /\b[a-zA-Z_]\w*(?=\s*=(?!=))/y, cls: C.attr },
    { re: /\b\d+(\.\d+)?\b/y, cls: C.number },
    { re: /[<>/={}()[\];,.]/y, cls: C.punct },
  ],
  json: [
    { re: /"[^"]*"(?=\s*:)/y, cls: C.key },
    { re: /"[^"]*"/y, cls: C.string },
    { re: /\b(true|false|null)\b/y, cls: C.bool },
    { re: /-?\d+(\.\d+)?/y, cls: C.number },
    { re: /[{}[\]:,]/y, cls: C.punct },
  ],
  bash: [
    { re: /#[^\n]*/y, cls: C.comment },
    { re: /"[^"]*"|'[^']*'/y, cls: C.string },
    { re: /\b(npm|npx|yarn|pnpm|curl|cd|install|run|add)\b/y, cls: C.keyword },
    { re: /-{1,2}[a-zA-Z][\w-]*/y, cls: C.attr },
  ],
};

export function highlight(code: string, lang: Lang): ReactNode {
  const rules = RULES[lang];
  const out: ReactNode[] = [];
  let i = 0;
  let plain = "";
  let key = 0;

  const flushPlain = () => {
    if (plain) {
      out.push(<Fragment key={key++}>{plain}</Fragment>);
      plain = "";
    }
  };

  while (i < code.length) {
    let matched = false;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (m && m.index === i && m[0].length > 0) {
        flushPlain();
        out.push(
          <span key={key++} className={rule.cls}>
            {m[0]}
          </span>
        );
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += code[i];
      i += 1;
    }
  }
  flushPlain();
  return out;
}
