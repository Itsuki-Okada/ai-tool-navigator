import type { PromptTemplate } from '../../types';

export const PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;

export const UNFILLED = '（未記入：内容に合わせて適切に判断してください）';

/** テンプレートの {{key}} を入力内容で置き換える */
export function fillTemplate(template: PromptTemplate, values: Record<string, string>): string {
  return template.body.replace(PLACEHOLDER_RE, (_, key: string) => {
    const v = values[key]?.trim();
    return v ? v : UNFILLED;
  });
}

export function missingRequired(template: PromptTemplate, values: Record<string, string>): string[] {
  return template.fields.filter((f) => f.required && !values[f.key]?.trim()).map((f) => f.label);
}

export function placeholdersOf(body: string): string[] {
  return [...body.matchAll(PLACEHOLDER_RE)].map((m) => m[1]);
}

export function searchTemplates(list: PromptTemplate[], query: string, group: string | null): PromptTemplate[] {
  const q = query.trim().toLowerCase();
  return list.filter((t) => {
    if (group && t.group !== group) return false;
    if (!q) return true;
    return [t.title, t.description, t.group, ...t.fields.map((f) => f.label)].some((s) => s.toLowerCase().includes(q));
  });
}
