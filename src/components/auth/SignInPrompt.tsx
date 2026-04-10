import { useLocation, useNavigate } from "react-router-dom";
import { getSignInRouteState } from "../../features/auth/signInNavigation";

type SignInPromptProps = {
  title: string;
  description: string;
};

export function SignInPrompt({ title, description }: SignInPromptProps) {
  const location = useLocation();
  const navigate = useNavigate();

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
        <button
          type="button"
          onClick={() => navigate("/signin", { state: getSignInRouteState(location) })}
          className="inline-block rounded-full bg-primary px-8 py-3 font-bold text-on-primary transition-colors hover:bg-primary/90"
        >
          Sign In / Sign Up
        </button>
      </div>
    </div>
  );
}
