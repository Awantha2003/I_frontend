import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false during server render and hydration, true afterwards.
// Lets components read localStorage without hydration mismatches.
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
