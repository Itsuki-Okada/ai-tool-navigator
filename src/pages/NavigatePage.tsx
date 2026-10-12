import { CategoryGrid } from '../components/home/CategoryGrid';
import { PageHeader, PrivacyNote } from '../components/ui/misc';

export function NavigatePage() {
  return (
    <>
      <PageHeader
        eyebrow="Step 01 — Select"
        title="何を作りたいですか？"
        description="近いカテゴリを選んでください。いくつかの質問に答えると、最適なAIとプロンプトを提案します。"
      >
        <PrivacyNote className="mt-4" />
      </PageHeader>
      <CategoryGrid headingLevel={2} />
    </>
  );
}
