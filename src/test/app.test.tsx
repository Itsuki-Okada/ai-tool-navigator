import { describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { STORAGE_KEY } from '../lib/storage/storage';

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  // ページ切り替え後に見出しへフォーカスが移るのを待つ
  await act(() => new Promise((r) => setTimeout(r, 80)));
}

describe('画面の動作', () => {
  it('トップページに12カテゴリが表示される', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /あなたの目的に/ })).toBeInTheDocument();
    for (const t of ['Webサイト・Webアプリ開発', '画像生成・イラスト・デザイン', 'その他・自由入力']) {
      expect(screen.getByRole('heading', { name: t })).toBeInTheDocument();
    }
    expect(screen.getByText('まだ診断履歴はありません')).toBeInTheDocument();
  });

  it('診断を最後まで進めると結果とプロンプトが表示され、履歴に保存される', async () => {
    const user = userEvent.setup();
    render(<App />);
    await go('#/navigate/writing');

    await user.type(await screen.findByLabelText('回答を入力'), '新商品の紹介ブログ');
    await user.click(screen.getByRole('button', { name: /次へ/ }));

    // 文章の種類：ブログ記事（自由入力ありのため自動では進まない）
    await user.click(await screen.findByRole('radio', { name: /ブログ記事/ }));
    expect(screen.getByRole('radio', { name: /ブログ記事/ })).toHaveAttribute('aria-checked', 'true');

    // 戻る → 回答が保持されている
    await user.click(screen.getByRole('button', { name: /次へ/ }));
    await screen.findByRole('heading', { name: '誰が読みますか？' });
    await user.click(screen.getByRole('button', { name: '戻る' }));
    expect(await screen.findByRole('radio', { name: /ブログ記事/ })).toHaveAttribute('aria-checked', 'true');

    // 残りはスキップ
    for (let i = 0; i < 20; i++) {
      const finish = screen.queryByRole('button', { name: '結果を見る' });
      if (finish) {
        await user.click(finish);
        break;
      }
      await user.click(screen.getByRole('button', { name: /次へ/ }));
    }

    expect(await screen.findByRole('heading', { level: 1, name: '新商品の紹介ブログ' }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('判断に影響した条件')).toBeInTheDocument();
    expect(screen.getByText('3つのAIの比較')).toBeInTheDocument();

    const editor = screen.getByLabelText('生成されたプロンプト') as HTMLTextAreaElement;
    expect(editor.value).toContain('新商品の紹介ブログ');

    // 出力先を切り替えると構成が変わる
    await user.click(screen.getByRole('radio', { name: /Claude向け/ }));
    expect((screen.getByLabelText('生成されたプロンプト') as HTMLTextAreaElement).value).toContain('<requirements>');
    await user.click(screen.getByRole('radio', { name: /ChatGPT向け/ }));
    expect((screen.getByLabelText('生成されたプロンプト') as HTMLTextAreaElement).value).not.toContain('<requirements>');

    // 編集して保存
    const ta = screen.getByLabelText('生成されたプロンプト');
    await user.clear(ta);
    await user.type(ta, '編集したプロンプト');
    expect(screen.getAllByText('編集済み').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(await screen.findByText('プロンプトを保存しました。')).toBeInTheDocument();

    await new Promise((r) => setTimeout(r, 300));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.history).toHaveLength(1);
    expect(stored.savedPrompts[0].body).toBe('編集したプロンプト');
    expect(stored.draft).toBeNull();
  });

  it('かんたん診断と詳しく診断を切り替えられ、操作方法の案内が表示される', async () => {
    const user = userEvent.setup();
    render(<App />);
    await go('#/navigate/web');
    const bar = await screen.findByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuetext', '5問中1問目');
    await user.click(screen.getByRole('radio', { name: /詳しく/ }));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toMatch(/^1[0-9]問中1問目$/);
    expect(screen.getByText('入力したら「次へ」を押してください（空欄のままでも進めます）')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /次へ/ }));
    // 自由入力欄がある質問は、選んでも自動では進まない（案内を表示）
    expect(await screen.findByText('選んだあと、必要なら補足を入力して「次へ」を押してください')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /ランディングページ/ }));
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByRole('heading', { name: '作りたいものの種類は？' })).toBeInTheDocument();
  });

  it('テンプレートで使用するAIを切り替えると形式が変わる', async () => {
    const user = userEvent.setup();
    render(<App />);
    await go('#/library/review');
    const value = () => (screen.getByLabelText('生成されたプロンプト') as HTMLTextAreaElement).value;
    await user.click(await screen.findByRole('radio', { name: 'ChatGPT向け' }));
    expect(value()).toContain('回答のルール');
    await user.click(screen.getByRole('radio', { name: 'Claude Code向け' }));
    expect(value()).toContain('ファイルを直接作成・編集');
  });

  it('保存一覧から削除できる（2段階確認）', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        savedPrompts: [{ id: 'p1', title: 'テスト用プロンプト', body: 'abc', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', source: 'manual' }],
      }),
    );
    render(<App />);
    await go('#/saved');
    const item = (await screen.findByRole('heading', { name: 'テスト用プロンプト' })).closest('li')!;
    await user.click(within(item).getByRole('button', { name: '削除' }));
    await user.click(within(item).getByRole('button', { name: '本当に削除する' }));
    expect(await screen.findByText('保存したプロンプトはまだありません')).toBeInTheDocument();
  });

  it('テンプレートは必須項目を検証し、入力内容でプロンプトが完成する', async () => {
    const user = userEvent.setup();
    render(<App />);
    await go('#/library/bug-error');
    await user.click(await screen.findByRole('button', { name: '保存' }));
    expect(screen.getAllByText('入力してください')).toHaveLength(2);

    await user.type(screen.getByLabelText(/何をしたらエラーが出たか/), 'npm run dev');
    await user.type(screen.getByLabelText(/エラーメッセージ/), 'Module not found');
    const preview = screen.getByLabelText('生成されたプロンプト') as HTMLTextAreaElement;
    expect(preview.value).toContain('npm run dev');
    expect(preview.value).toContain('Module not found');
    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(await screen.findByText('プロンプトを保存しました。')).toBeInTheDocument();
  });

  it('AI比較ページに最終確認日と注意書きを表示', async () => {
    render(<App />);
    await go('#/compare');
    expect(await screen.findByText(/掲載情報の最終確認日/)).toBeInTheDocument();
    expect(screen.getAllByText('プラン・モデルで異なる').length).toBeGreaterThan(0);
  });

  it('存在しないページ・結果は案内を表示', async () => {
    render(<App />);
    await go('#/unknown');
    expect(await screen.findByText('ページが見つかりません')).toBeInTheDocument();
    await go('#/result/nope');
    expect(await screen.findByText('診断結果が見つかりません')).toBeInTheDocument();
  });
});
