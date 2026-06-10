'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib';
import { katex } from '@mdit/plugin-katex';
import { renderToString } from 'katex';
import MarkdownIt from 'markdown-it';

/* ─────────────────────────────────────────────────────
 * MathMarkdown — 수식(KaTeX) 포함 마크다운 렌더러
 *
 *  AI 코치 패널이 쓰던 markdown-it + @mdit/plugin-katex 설정을
 *  공통화한 컴포넌트. 정답 해설 등 수식 본문 렌더에 재사용한다.
 *  - 평문 금지(수학 앱 필수): `$...$`, ``` `\frac...` `` 인라인 수식을 KaTeX로.
 *  - DOMPurify로 산출 HTML 새니타이즈.
 * ────────────────────────────────────────────────────*/
const MARKDOWN_SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true, mathMl: true },
} as const;

const KATEX_INLINE_OPTIONS = {
  displayMode: false,
  throwOnError: false,
} as const;

const MATH_CODE_PATTERN =
  /(?:\\(?:frac|sqrt|sum|int|lim|left|right|cdot|times|pm)|[A-Za-z0-9)]\s*\^\s*(?:[A-Za-z0-9]|\{[^}]+\})|[A-Za-z]\s*=\s*[-+*/()A-Za-z0-9\s^]+|[+\-*/]\s*[A-Za-z0-9(\\])/;

const markdownRenderer = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
});

markdownRenderer.use(katex, {
  delimiters: 'all',
  mathFence: true,
});

const defaultCodeInlineRule = markdownRenderer.renderer.rules.code_inline;

markdownRenderer.renderer.rules.code_inline = (
  tokens,
  index,
  options,
  env,
  self
) => {
  const content = tokens[index]?.content ?? '';

  if (MATH_CODE_PATTERN.test(content)) {
    return renderToString(content, KATEX_INLINE_OPTIONS);
  }

  return defaultCodeInlineRule
    ? defaultCodeInlineRule(tokens, index, options, env, self)
    : self.renderToken(tokens, index, options);
};

type MathMarkdownProps = {
  content: string;
  className?: string;
};

export const MathMarkdown = ({ content, className }: MathMarkdownProps) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let isCurrent = true;

    const renderMarkdown = async () => {
      const { default: DOMPurify } = await import('dompurify');

      if (!isCurrent) return;

      setHtml(
        DOMPurify.sanitize(
          markdownRenderer.render(content),
          MARKDOWN_SANITIZE_OPTIONS
        )
      );
    };

    setHtml('');
    renderMarkdown();

    return () => {
      isCurrent = false;
    };
  }, [content]);

  return (
    <div
      className={cn('ai-coach-markdown', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
