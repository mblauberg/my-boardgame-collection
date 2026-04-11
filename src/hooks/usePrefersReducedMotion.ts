import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const NO_PREFERENCE_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

function computePrefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  const noPreferenceQuery = window.matchMedia(NO_PREFERENCE_MOTION_QUERY);

  if (noPreferenceQuery.matches) {
    return false;
  }

  return reducedMotionQuery.matches;
}

function getInitialValue() {
  return computePrefersReducedMotion();
}

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialValue);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const noPreferenceQuery = window.matchMedia(NO_PREFERENCE_MOTION_QUERY);
    const handleChange = () => {
      setPrefersReducedMotion(computePrefersReducedMotion());
    };

    setPrefersReducedMotion(computePrefersReducedMotion());

    if (
      typeof reducedMotionQuery.addEventListener === "function" &&
      typeof noPreferenceQuery.addEventListener === "function"
    ) {
      reducedMotionQuery.addEventListener("change", handleChange);
      noPreferenceQuery.addEventListener("change", handleChange);
      return () => {
        reducedMotionQuery.removeEventListener("change", handleChange);
        noPreferenceQuery.removeEventListener("change", handleChange);
      };
    }

    reducedMotionQuery.addListener(handleChange);
    noPreferenceQuery.addListener(handleChange);
    return () => {
      reducedMotionQuery.removeListener(handleChange);
      noPreferenceQuery.removeListener(handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
