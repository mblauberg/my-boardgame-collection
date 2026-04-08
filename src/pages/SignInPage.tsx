import { SignInForm } from "../features/auth/SignInForm";

export function SignInPage() {
  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email to receive a magic link
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
