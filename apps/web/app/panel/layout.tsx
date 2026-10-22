import PanelHeader from '@/components/PanelHeader';

export const metadata = { title: 'Yönetim Paneli' };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-100">
      <PanelHeader />
      <div className="mx-auto max-w-5xl p-6">{children}</div>
    </div>
  );
}
