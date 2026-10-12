import { useState } from 'react';
import { ArrowLeft, Check, SearchX, Save } from 'lucide-react';
import { CATEGORY_MAP } from '../data/categories';
import { TARGET_PROFILES } from '../data/promptRecipes';
import { TEMPLATE_MAP } from '../data/templates';
import { PromptEditor } from '../components/prompt/PromptEditor';
import { Button, LinkButton } from '../components/ui/Button';
import { Chip, ConfirmButton, EmptyState } from '../components/ui/misc';
import { LIMITS } from '../lib/storage/validate';
import { formatDate } from '../lib/utils';
import { navigate } from '../state/router';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import type { SavedPrompt } from '../types';

export function SavedItemPage({ id }: { id: string }) {
  const { data } = useStore();
  const p = data.savedPrompts.find((x) => x.id === id);
  if (!p) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<SearchX className="size-5" />}
          title="プロンプトが見つかりません"
          description="削除されたか、別のブラウザで保存したものの可能性があります。"
          action={<LinkButton href="#/saved">保存一覧へ</LinkButton>}
        />
      </div>
    );
  }
  return <Editor key={p.id} prompt={p} />;
}

function Editor({ prompt: p }: { prompt: SavedPrompt }) {
  const { updatePrompt, deletePrompt } = useStore();
  const toast = useToast();
  const [title, setTitle] = useState(p.title);
  const [body, setBody] = useState(p.body);
  const dirty = title !== p.title || body !== p.body;

  const save = () => {
    updatePrompt(p.id, { title, body });
    toast.show('変更を保存しました。', 'success');
  };

  return (
    <div className="pt-8 sm:pt-12">
      <a href="#/saved" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> 保存一覧
      </a>
      <div className="mb-6 animate-fade-up">
        <label htmlFor="title" className="label-mono mb-2 block">
          タイトル
        </label>
        <input
          id="title"
          value={title}
          maxLength={LIMITS.title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border hairline bg-ink-900/70 px-4 py-3 text-xl font-semibold text-fg focus:border-accent/50 focus:outline-none sm:text-2xl"
        />
        <h1 className="sr-only" tabIndex={-1} data-page-title>
          プロンプトの編集
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-faint">
          {p.categoryId && <Chip>{CATEGORY_MAP[p.categoryId].short}</Chip>}
          {p.templateId && TEMPLATE_MAP[p.templateId] && <Chip>{TEMPLATE_MAP[p.templateId].title}</Chip>}
          {p.target && <Chip>{TARGET_PROFILES[p.target].label}</Chip>}
          <span className="ml-1">作成 {formatDate(p.createdAt)}</span>
          <span>・更新 {formatDate(p.updatedAt)}</span>
          {dirty && <Chip tone="warn">未保存の変更があります</Chip>}
        </div>
      </div>
      <div className="animate-fade-up [animation-delay:.08s]">
        <PromptEditor
          value={body}
          onChange={setBody}
          edited={body !== p.body}
          onReset={() => setBody(p.body)}
          label="プロンプト本文"
          minRows={22}
          actions={
            <Button onClick={save} disabled={!dirty} icon={dirty ? <Save className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}>
              {dirty ? '変更を保存' : '保存済み'}
            </Button>
          }
        />
      </div>
      <div className="mt-6 flex justify-end">
        <ConfirmButton
          size="md"
          label="このプロンプトを削除"
          confirmLabel="本当に削除する"
          onConfirm={() => {
            deletePrompt(p.id);
            toast.show('プロンプトを削除しました。', 'info');
            navigate('/saved');
          }}
        />
      </div>
    </div>
  );
}
