import { SignInForm } from "../features/auth/SignInForm";

export function SignInPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center py-12 font-['Manrope'] text-on-surface">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          Sign In
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-on-surface-variant">
          The curated portal to your board game gallery.
        </p>
      </div>
      <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-8 shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
        <SignInForm />
      </div>
    </div>
  );
}
