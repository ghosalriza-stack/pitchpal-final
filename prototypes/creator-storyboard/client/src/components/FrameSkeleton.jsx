export default function FrameSkeleton({ index }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 border border-ink/10 rounded-lg bg-card">
      <div className="w-full md:w-5/12 rounded overflow-hidden relative shimmer" style={{ minHeight: 240 }}>
        <div className="absolute top-2 left-2 bg-ink/20 text-transparent text-xs font-bold px-2 py-1 rounded">
          FRAME {(index + 1).toString().padStart(2, '0')}
        </div>
      </div>
      <div className="w-full md:w-7/12 flex flex-col gap-4">
        <div className="h-20 rounded shimmer" />
        <div className="h-16 rounded shimmer" />
      </div>
    </div>
  );
}
