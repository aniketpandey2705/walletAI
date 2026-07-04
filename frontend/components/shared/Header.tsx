import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
      <div className="w-full flex-1">
        {/* Can add search bar here in future */}
      </div>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
