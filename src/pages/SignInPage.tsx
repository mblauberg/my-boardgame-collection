import { SignInForm } from "../features/auth/SignInForm";

export function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 w-full text-[#2e2f2d] font-['Manrope']">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#8a4c00]">
          Sign In
        </h1>
        <p className="mt-4 text-lg text-[#2e2f2d]/80 max-w-sm mx-auto leading-relaxed">
          The curated portal to your board game gallery.
        </p>
      </div>
      <div className="w-full max-w-md bg-[#ffffff] rounded-xl shadow-[0_12px_40px_rgba(46,47,45,0.06)] p-8">
        <SignInForm />
      </div>
    </div>
  );
}
