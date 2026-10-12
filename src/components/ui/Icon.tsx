import {
  Briefcase,
  ChartColumn,
  Clapperboard,
  Code2,
  Globe,
  Lightbulb,
  Megaphone,
  Palette,
  PenLine,
  Search,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

/** データ側ではアイコンを名前（文字列）で持ち、ここで実体に変換します */
const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  ChartColumn,
  Clapperboard,
  Code2,
  Globe,
  Lightbulb,
  Megaphone,
  Palette,
  PenLine,
  Search,
  Sparkles,
  Workflow,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Sparkles;
  return <C className={className} aria-hidden />;
}
