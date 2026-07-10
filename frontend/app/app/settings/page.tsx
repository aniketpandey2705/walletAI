export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col gap-1.5 border-b border-[var(--border)] pb-8">
        <h1 className="text-[24px] font-medium text-[var(--foreground)] tracking-tight leading-none">Settings</h1>
        <span className="text-[14px] text-[var(--foreground)]">Manage your preferences</span>
      </div>
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-2 text-center max-w-sm">
          <h3 className="text-[15px] font-medium text-[var(--foreground)]">
            Settings are under construction
          </h3>
          <p className="text-[14px] text-[var(--secondary-text)] leading-relaxed">
            We're currently building out the profile and preference management tools. Check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
