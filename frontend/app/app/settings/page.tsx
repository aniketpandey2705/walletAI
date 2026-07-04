export default function SettingsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Profile Settings Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your password, email, and preferences here.
          </p>
        </div>
      </div>
    </>
  );
}
