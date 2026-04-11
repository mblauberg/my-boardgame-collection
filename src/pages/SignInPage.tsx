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
      <div className="glass-surface-panel rounded-[1.75rem] p-4 sm:p-5">
        <SignInForm />
      </div>
    </SignInOverlayFrame>
  );
}
