import { useLocation, useNavigate } from "react-router-dom";
import { SignInOverlayFrame } from "../components/auth/SignInOverlayFrame";
import { SignInForm } from "../features/auth/SignInForm";

export function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { backgroundLocation?: unknown } | null;
  const isModal = !!state?.backgroundLocation;

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <SignInOverlayFrame isStandalone={!isModal} onRequestClose={handleClose}>
      <div className="rounded-[1.75rem] border border-outline/10 bg-surface-container-lowest/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:bg-surface-container-low/55 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5">
        <SignInForm />
      </div>
    </SignInOverlayFrame>
  );
}
