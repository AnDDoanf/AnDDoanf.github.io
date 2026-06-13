const MOBILE_MEDIA_QUERY = "(max-width: 768px)";
const MOBILE_NAV_EVENT = "mobile-nav-open-change";

let isMobileNavOpen = false;

export function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function subscribeToMobileViewport(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
  const handleViewportChange = () => callback();

  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", handleViewportChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleViewportChange);
    };
  }

  mediaQueryList.addListener(handleViewportChange);

  return () => {
    mediaQueryList.removeListener(handleViewportChange);
  };
}

export function getIsMobileNavOpen() {
  return isMobileNavOpen;
}

export function subscribeToMobileNav(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(MOBILE_NAV_EVENT, callback);

  return () => {
    window.removeEventListener(MOBILE_NAV_EVENT, callback);
  };
}

export function setIsMobileNavOpen(nextValue) {
  isMobileNavOpen = Boolean(nextValue);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MOBILE_NAV_EVENT));
  }
}

export function toggleMobileNavOpen() {
  setIsMobileNavOpen(!isMobileNavOpen);
}
