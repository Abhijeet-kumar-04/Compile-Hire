import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-glow/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <SignIn appearance={{ elements: { rootBox: "shadow-[0_0_50px_rgba(99,102,241,0.2)] rounded-2xl" } }} />
      </div>
    </div>
  );
}
