export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-emerald-100" role="status" aria-label="Memuat halaman">
      <div className="h-full w-1/3 animate-[loading-slide_900ms_ease-in-out_infinite] bg-emerald-600" />
    </div>
  );
}
