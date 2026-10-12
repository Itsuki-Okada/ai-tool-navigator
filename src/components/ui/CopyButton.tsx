import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../../lib/utils';
import { Button } from './Button';

interface Props {
  getText: () => string;
  /** コピーに失敗したとき、手動コピー用にテキストを選択状態にする */
  onFallback?: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function CopyButton({ getText, onFallback, label = 'プロンプトをコピー', size = 'md', variant = 'primary', className }: Props) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    const text = getText();
    if (!text.trim()) return;
    const ok = await copyText(text);
    setState(ok ? 'done' : 'failed');
    if (!ok) onFallback?.();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), ok ? 2200 : 5000);
  };

  return (
    <span className="inline-flex flex-col items-stretch gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        className={className}
        aria-live="polite"
        icon={
          state === 'done' ? (
            <Check className="size-4 animate-pop" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )
        }
      >
        {state === 'done' ? 'コピーしました' : label}
      </Button>
      {state === 'failed' && (
        <span role="alert" className="text-xs text-warn">
          自動コピーできませんでした。テキストを選択したので、Ctrl+C（Macは ⌘+C）でコピーしてください。
        </span>
      )}
    </span>
  );
}
