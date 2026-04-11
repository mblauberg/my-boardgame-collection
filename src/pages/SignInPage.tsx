import { useLocation, useNavigate } from "react-router-dom";
import { SignInOverlayFrame } from "../components/auth/SignInOverlayFrame";
import { SurfacePanel } from "../components/ui/SurfacePanel";
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
      <SurfacePanel spacing="compact" className="rounded-2xl sm:p-5">
        <SignInForm />
      </SurfacePanel>
    </SignInOverlayFrame>
  );
}
