export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex items-end justify-between border-b border-black/5 pb-8">
        <div>
          <h1 className="text-[28px] font-medium text-foreground tracking-tight leading-none mb-2">Settings</h1>
          <span className="text-sm text-muted-foreground">Manage your preferences</span>
        </div>
      </div>
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-[15px] font-medium text-foreground">
            Profile Settings Coming Soon
          </h3>
          <p className="text-[13px] text-muted-foreground">
            Manage your password, email, and preferences here.
          </p>
        </div>
      </div>
    </div>
  );
}
