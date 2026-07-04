import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div className="flex flex-1 justify-center">
        <UserProfile path="/app/settings" routing="path" />
      </div>
    </>
  );
}
