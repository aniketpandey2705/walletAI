export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex items-end justify-between border-b border-black/5 pb-8">
        <div>
          <h1 className="text-[28px] font-medium text-foreground tracking-tight leading-none mb-2">Categories</h1>
          <span className="text-sm text-muted-foreground">Manage your spending categories</span>
        </div>
      </div>
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-[15px] font-medium text-foreground">
            Category Breakdown Coming Soon
          </h3>
          <p className="text-[13px] text-muted-foreground">
            We'll build this in Checkpoint 6.
          </p>
        </div>
      </div>
    </div>
  );
}
