import { Link } from "react-router-dom";

type SignInPromptProps = {
  title: string;
  description: string;
};

export function SignInPrompt({ title, description }: SignInPromptProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">🎲</div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-on-surface">
          {title}
        </h2>
        <p className="mb-8 text-base leading-relaxed text-on-surface-variant">
          {description}
        </p>
        <Link
          to="/signin"
          className="inline-block rounded-full bg-primary px-8 py-3 font-bold text-on-primary transition-colors hover:bg-primary/90"
        >
          Sign In / Sign Up
        </Link>
      </div>
    </div>
  );
}
