import Sidebar from "@/components/Sidebar";
import AutoPredictor from "@/components/AutoPredictor";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gradient-to-b from-black to-purple-900">
      <AutoPredictor />

      {/* Sidebar (fixed width, no scroll) */}
      <aside className="w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main content (scrollable) */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
