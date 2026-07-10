export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col gap-1.5 border-b border-[var(--border)] pb-8">
        <h1 className="text-[24px] font-medium text-[var(--foreground)] tracking-tight leading-none">Categories</h1>
        <span className="text-[14px] text-[var(--foreground)]">Manage your spending categories</span>
      </div>
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-2 text-center max-w-sm">
          <h3 className="text-[15px] font-medium text-[var(--foreground)]">
            Category breakdown coming soon
          </h3>
          <p className="text-[14px] text-[var(--secondary-text)] leading-relaxed">
            We're building out advanced category management tools. Check back in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
