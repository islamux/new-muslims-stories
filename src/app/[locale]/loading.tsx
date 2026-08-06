export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" aria-busy="true" aria-live="polite">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mb-8 h-10 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mb-4 h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mb-4 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mb-10 h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
