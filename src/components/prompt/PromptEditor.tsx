import { useId, useRef, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';
import { Button } from '../ui/Button';
import { Chip } from '../ui/misc';

/**
 * プロンプトの編集エリア（その場で編集 → コピー・保存）
 * 入力内容はテキストとして扱い、HTMLとして実行しません。
 */
export function PromptEditor({
  value,
  onChange,
  edited,
  onReset,
  actions,
  label = '生成されたプロンプト',
  minRows = 18,
}: {
  value: string;
  onChange: (v: string) => void;
  edited: boolean;
  onReset?: () => void;
  actions?: ReactNode;
  label?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const selectAll = () => {
    ref.current?.focus();
    ref.current?.select();
  };

  return (
    <div className="overflow-hidden rounded-2xl border hairline bg-ink-900/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b hairline bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2 rounded-full bg-white/10" />
            <span className="size-2 rounded-full bg-white/10" />
            <span className="size-2 rounded-full bg-accent/60" />
          </span>
          <label htmlFor={id} className="label-mono">
            {label}
          </label>
          {edited && <Chip tone="accent">編集済み</Chip>}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-faint">{value.length.toLocaleString()} 文字</span>
          {edited && onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} icon={<RotateCcw className="size-3.5" aria-hidden />}>
              生成した内容に戻す
            </Button>
          )}
        </div>
      </div>
      <textarea
        id={id}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={minRows}
        spellCheck={false}
        className="prompt-area block max-h-[70vh] min-h-64 w-full resize-y bg-transparent px-4 py-4 text-fg-soft outline-none focus:text-fg sm:px-5"
        aria-describedby={`${id}-hint`}
      />
      <div className="flex flex-col gap-3 border-t hairline bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p id={`${id}-hint`} className="text-xs text-muted">
          このまま編集できます。編集した内容がコピー・保存されます。
        </p>
        <div className="flex flex-wrap items-start gap-2">
          {actions}
          <CopyButton getText={() => value} onFallback={selectAll} />
        </div>
      </div>
    </div>
  );
}
