import { SignInForm } from "../features/auth/SignInForm";

export function SignInPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-14rem)] w-full flex-col items-center justify-center font-['Manrope'] text-on-surface md:min-h-[calc(100vh-12rem)]">
      {/* Edge-to-edge Background Orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute -top-[5%] left-[10%] h-[40vmax] w-[40vmax] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-[5%] right-[10%] h-[35vmax] w-[35vmax] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="glass-surface-panel w-full max-w-md rounded-[2.5rem] p-8 shadow-ambient transition-all md:p-10">
        <SignInForm />
      </div>
    </div>
  );
}
