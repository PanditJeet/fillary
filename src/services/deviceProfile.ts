/**
 * Rough device class detection, used to scale down expensive effects on weak phones.
 * "Low end" = 3 GB RAM or less (where the browser reports it) or 4 CPU cores or fewer.
 */
export const LOW_END: boolean = (() => {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory;
    const cores = nav.hardwareConcurrency || 8;
    return (memory !== undefined && memory <= 3) || cores <= 4;
  } catch {
    return false;
  }
})();
