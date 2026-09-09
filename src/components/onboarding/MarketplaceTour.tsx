"use client";

import Picture from "@/components/picture/Index";
import { mascotThreeQuarter } from "../../../public/dev_images";
import { usePathname, useRouter } from "next/navigation";
import {
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const MARKETPLACE_WELCOME_STORAGE_KEY = "quiva_marketplace_welcome_completed";
export const MARKETPLACE_TOUR_STORAGE_KEY = "quiva_marketplace_tour_completed";
export const MARKETPLACE_TOUR_STEP_STORAGE_KEY = "quiva_marketplace_tour_step";

export function resetMarketplaceOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MARKETPLACE_WELCOME_STORAGE_KEY);
  window.localStorage.removeItem(MARKETPLACE_TOUR_STORAGE_KEY);
  window.localStorage.removeItem(MARKETPLACE_TOUR_STEP_STORAGE_KEY);
}

type TourStep = {
  target: string;
  title: string;
  description: string;
  placement: "bottom-left" | "below" | "above" | "right";
};

type TargetBox = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  found: boolean;
};

type TooltipPosition = {
  top: number;
  left: number;
  arrow: "top" | "bottom" | "left" | "none";
  mode: "anchored" | "bottom-sheet";
};

const steps: TourStep[] = [
  {
    target: "connect-wallet",
    title: "Trade your collection",
    description: "Connect with RainbowKit to unlock the supported ownership and purchase features.",
    placement: "bottom-left",
  },
  {
    target: "upcoming-sales",
    title: "Up coming sales",
    description: "Browse new comic releases. Limited editions drop regularly, be the first.",
    placement: "below",
  },
  {
    target: "canon-table",
    title: "Trade Your Collection",
    description: "Buy and collect supported comic releases in the marketplace.",
    placement: "above",
  },
  {
    target: "publish-comic",
    title: "Publish your work",
    description: "Upload and publish your work through ComicPad.",
    placement: "right",
  },
  {
    target: "trending-collections",
    title: "Collect On-chain",
    description: "Mint a comic to own it on-chain and read it from your collection.",
    placement: "above",
  },
];

const TARGET_PADDING = 8;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 240;
const VIEWPORT_GAP = 16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hasCompleted(key: string) {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(key) === "true";
}

function setCompleted(key: string) {
  window.localStorage.setItem(key, "true");
}

function clearStoredStep() {
  window.localStorage.removeItem(MARKETPLACE_TOUR_STEP_STORAGE_KEY);
}

function getStoredStepIndex() {
  if (typeof window === "undefined") return 0;

  const rawStep = window.localStorage.getItem(MARKETPLACE_TOUR_STEP_STORAGE_KEY);
  const parsedStep = rawStep == null ? 0 : Number(rawStep);

  if (!Number.isInteger(parsedStep) || parsedStep < 0 || parsedStep >= steps.length) {
    window.localStorage.removeItem(MARKETPLACE_TOUR_STEP_STORAGE_KEY);
    return 0;
  }

  return parsedStep;
}

function setStoredStep(index: number) {
  window.localStorage.setItem(MARKETPLACE_TOUR_STEP_STORAGE_KEY, String(index));
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function focusFirst(containerRef: RefObject<HTMLElement>) {
  window.setTimeout(() => {
    const focusable = getFocusableElements(containerRef.current);
    focusable[0]?.focus();
  }, 0);
}

function handleFocusTrap(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;

  const focusable = getFocusableElements(event.currentTarget);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function getVisibleTarget(target: string): HTMLElement | null {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`));

  return (
    elements.find((element) => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && styles.visibility !== "hidden" && styles.display !== "none";
    }) ?? null
  );
}

function getTargetBox(target: string): TargetBox | null {
  const element = getVisibleTarget(target);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
    found: true,
  };
}

function getBottomSheetPosition(): TooltipPosition {
  const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);

  return {
    top: Math.max(VIEWPORT_GAP, window.innerHeight - TOOLTIP_HEIGHT - VIEWPORT_GAP),
    left: (window.innerWidth - width) / 2,
    arrow: "none",
    mode: "bottom-sheet",
  };
}

function getTooltipPosition(box: TargetBox | null, placement: TourStep["placement"]): TooltipPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(TOOLTIP_WIDTH, viewportWidth - VIEWPORT_GAP * 2);

  if (!box || box.width <= 0 || box.height <= 0) return getBottomSheetPosition();

  const targetCenterX = box.left + box.width / 2;
  const targetCenterY = box.top + box.height / 2;
  let top = box.bottom + 16;
  let left = box.left;
  let arrow: TooltipPosition["arrow"] = "top";

  if (placement === "above") {
    top = box.top - TOOLTIP_HEIGHT - 16;
    left = targetCenterX - width / 2;
    arrow = "bottom";
  }

  if (placement === "below") {
    top = box.bottom + 16;
    left = targetCenterX - width / 2;
    arrow = "top";
  }

  if (placement === "right") {
    top = targetCenterY - TOOLTIP_HEIGHT / 2;
    left = box.right + 16;
    arrow = "left";
  }

  if (placement === "bottom-left") {
    top = box.bottom + 16;
    left = box.right - width;
    arrow = "top";
  }

  const hasRoom =
    left >= VIEWPORT_GAP &&
    left + width <= viewportWidth - VIEWPORT_GAP &&
    top >= VIEWPORT_GAP &&
    top + TOOLTIP_HEIGHT <= viewportHeight - VIEWPORT_GAP;

  if (viewportWidth < 640 || !hasRoom) {
    const centeredLeft = clamp(targetCenterX - width / 2, VIEWPORT_GAP, viewportWidth - width - VIEWPORT_GAP);
    const clampedTop = clamp(top, VIEWPORT_GAP, viewportHeight - TOOLTIP_HEIGHT - VIEWPORT_GAP);
    const clampedHasRoom = clampedTop >= VIEWPORT_GAP && clampedTop + TOOLTIP_HEIGHT <= viewportHeight - VIEWPORT_GAP;

    if (viewportWidth < 640 || !clampedHasRoom) return getBottomSheetPosition();

    return {
      top: clampedTop,
      left: centeredLeft,
      arrow: "none",
      mode: "anchored",
    };
  }

  return { top, left, arrow, mode: "anchored" };
}

export default function MarketplaceTour() {
  const pathname = usePathname();
  const router = useRouter();

  const welcomeRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [showWelcome, setShowWelcome] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [suppressGuestTourStart, setSuppressGuestTourStart] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);

  const activeStep = steps[currentStep];

  const completeTour = useCallback(() => {
    setCompleted(MARKETPLACE_TOUR_STORAGE_KEY);
    clearStoredStep();
    setShowWelcome(false);
    setIsTourActive(false);
    setSuppressGuestTourStart(false);
  }, []);

  const openWalletModal = useCallback(() => {
    const target = getVisibleTarget("connect-wallet");
    const connectButton =
      target instanceof HTMLButtonElement ? target : target?.querySelector<HTMLButtonElement>("button");
    connectButton?.click();
  }, []);

  const updatePosition = useCallback(() => {
    if (!isTourActive || !activeStep) return;

    const box = getTargetBox(activeStep.target);
    setTargetBox(box);
    setTooltipPosition(getTooltipPosition(box, activeStep.placement));
  }, [activeStep, isTourActive]);

  const startTour = useCallback(() => {
    if (pathname !== "/marketplace") return;
    if (hasCompleted(MARKETPLACE_TOUR_STORAGE_KEY)) return;

    setCurrentStep(getStoredStepIndex());
    setSuppressGuestTourStart(false);
    setShowWelcome(false);
    setIsTourActive(true);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/marketplace") {
      setShowWelcome(false);
      setIsTourActive(false);
      setSuppressGuestTourStart(false);
      return;
    }

    if (!hasCompleted(MARKETPLACE_WELCOME_STORAGE_KEY)) {
      setShowWelcome(true);
      return;
    }

    if (!suppressGuestTourStart && !hasCompleted(MARKETPLACE_TOUR_STORAGE_KEY)) {
      startTour();
    }
  }, [pathname, startTour, suppressGuestTourStart]);

  useEffect(() => {
    if (showWelcome) focusFirst(welcomeRef);
  }, [showWelcome]);

  useEffect(() => {
    if (isTourActive) focusFirst(tooltipRef);
  }, [currentStep, isTourActive]);

  useEffect(() => {
    if (!isTourActive || !activeStep) return;

    const target = getVisibleTarget(activeStep.target);
    target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    const frame = window.setTimeout(updatePosition, 420);
    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.clearTimeout(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeStep, currentStep, isTourActive, updatePosition]);

  useEffect(() => {
    if (!showWelcome && !isTourActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (isTourActive) {
        completeTour();
        return;
      }

      setShowWelcome(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completeTour, isTourActive, showWelcome]);

  const handleStartExploring = () => {
    setCompleted(MARKETPLACE_WELCOME_STORAGE_KEY);
    setShowWelcome(false);
    startTour();
  };

  const handleConnectWallet = () => {
    setCompleted(MARKETPLACE_WELCOME_STORAGE_KEY);
    setShowWelcome(false);
    setSuppressGuestTourStart(true);
    window.setTimeout(openWalletModal, 50);
  };

  const handleBecomeCreator = () => {
    setCompleted(MARKETPLACE_WELCOME_STORAGE_KEY);
    setShowWelcome(false);
    router.push("/comic-pad");
  };

  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      completeTour();
      return;
    }

    const nextStep = currentStep + 1;
    setStoredStep(nextStep);
    setCurrentStep(nextStep);
  };

  const highlight = targetBox?.found
    ? {
        top: Math.max(targetBox.top - TARGET_PADDING, 0),
        left: Math.max(targetBox.left - TARGET_PADDING, 0),
        width: targetBox.width + TARGET_PADDING * 2,
        height: targetBox.height + TARGET_PADDING * 2,
      }
    : null;

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md">
          <div
            ref={welcomeRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="marketplace-welcome-title"
            className="w-full max-w-5xl rounded-[24px] bg-black-200 px-5 py-8 text-center shadow-2xl sm:px-10 lg:px-16"
            onKeyDown={handleFocusTrap}
          >
            <div className="mx-auto mb-3 flex max-w-sm justify-center">
              <Picture
                src={mascotThreeQuarter}
                alt="Quiva illustration"
                width={380}
                height={320}
                className="h-auto max-h-72 w-full object-contain"
                priority
              />
            </div>

            <h2 id="marketplace-welcome-title" className="text-3xl font-bold text-white sm:text-4xl">
              Welcome to Quiva
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-white/55 sm:text-lg">
              A new world of comics where the stories you love are yours to collect, and the creators you support are rewarded every time.
            </p>

            <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4">
              <button
                type="button"
                aria-label="Explore Marketplace"
                onClick={handleStartExploring}
                className="rounded-full bg-secondary-200 px-6 py-4 text-sm font-semibold text-black-200 transition hover:bg-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:ring-offset-2 focus:ring-offset-black-200"
              >
                Explore Marketplace
              </button>
              <button
                type="button"
                aria-label="Connect Wallet"
                onClick={handleConnectWallet}
                className="rounded-full border-2 border-white px-6 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-black-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black-200"
              >
                Connect Wallet
              </button>
              <button
                type="button"
                aria-label="Become a creator"
                onClick={handleBecomeCreator}
                className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black-200"
              >
                Become a creator
              </button>
            </div>
          </div>
        </div>
      )}

      {isTourActive && activeStep && tooltipPosition && (
        <div className="fixed inset-0 z-[500] pointer-events-none">
          {highlight ? (
            <>
              <div className="fixed left-0 top-0 bg-black/72" style={{ width: "100vw", height: highlight.top }} />
              <div className="fixed left-0 bg-black/72" style={{ top: highlight.top, width: highlight.left, height: highlight.height }} />
              <div
                className="fixed bg-black/72"
                style={{
                  top: highlight.top,
                  left: highlight.left + highlight.width,
                  width: `calc(100vw - ${highlight.left + highlight.width}px)`,
                  height: highlight.height,
                }}
              />
              <div
                className="fixed left-0 bg-black/72"
                style={{
                  top: highlight.top + highlight.height,
                  width: "100vw",
                  height: `calc(100vh - ${highlight.top + highlight.height}px)`,
                }}
              />
              <div
                className="fixed rounded-2xl border-2 border-secondary-200 shadow-[0_0_0_2px_rgba(255,255,255,0.18),0_0_34px_rgba(250,163,30,0.55)]"
                style={highlight}
              />
            </>
          ) : (
            <div className="fixed inset-0 bg-black/72" />
          )}

          <div
            ref={tooltipRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="marketplace-tour-title"
            aria-describedby="marketplace-tour-description"
            className={`pointer-events-auto fixed w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-white p-4 text-black-200 shadow-2xl ${
              tooltipPosition.mode === "bottom-sheet" ? "rounded-b-none sm:rounded-b-xl" : ""
            }`}
            style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
            onKeyDown={handleFocusTrap}
          >
            {tooltipPosition.arrow !== "none" && (
              <span
                className={`absolute h-4 w-4 rotate-45 bg-white ${
                  tooltipPosition.arrow === "top"
                    ? "-top-2 left-8"
                    : tooltipPosition.arrow === "bottom"
                      ? "-bottom-2 left-8"
                      : "left-[-8px] top-1/2 -translate-y-1/2"
                }`}
              />
            )}

            <p className="relative text-[10px] font-bold uppercase tracking-wide text-secondary-200">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h3 id="marketplace-tour-title" className="relative mt-1 text-lg font-bold text-black-200">
              {activeStep.title}
            </h3>
            <p id="marketplace-tour-description" className="relative mt-2 text-sm leading-5 text-black-200/60">
              {activeStep.description}
            </p>

            <div className="relative mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5" aria-label={`Tour progress, step ${currentStep + 1} of ${steps.length}`}>
                {steps.map((_, index) => (
                  <span
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === currentStep ? "bg-secondary-200" : "bg-black-200/15"}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Skip marketplace tour"
                  onClick={completeTour}
                  className="text-xs font-medium text-black-200/45 hover:text-black-200 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  Skip
                </button>
                <button
                  type="button"
                  aria-label={currentStep === steps.length - 1 ? "Finish marketplace tour" : "Next marketplace tour step"}
                  onClick={handleNext}
                  className="rounded-md bg-secondary-200 px-4 py-2 text-xs font-semibold text-white hover:bg-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:ring-offset-2 focus:ring-offset-white"
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
