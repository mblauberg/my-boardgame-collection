import { useLocation, useNavigate } from "react-router-dom";
import { SignInOverlayFrame } from "../components/auth/SignInOverlayFrame";
import { SignInForm } from "../features/auth/SignInForm";
import { getReturnToFromState } from "../features/auth/signInNavigation";

export function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { backgroundLocation?: unknown } | null;
  const isModal = !!state?.backgroundLocation;
  const returnTo = getReturnToFromState(location.state);

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
      return;
    }

    navigate(returnTo);
  };

  return (
    <SignInOverlayFrame isStandalone={!isModal} onRequestClose={handleClose}>
      <SignInForm />
    </SignInOverlayFrame>
  );
}
