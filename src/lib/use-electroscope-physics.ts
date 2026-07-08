"use client";

import { useMemo } from "react";
import { useSimStore } from "./sim-store";
import { computeElectroscope, ElectroscopePhysics, SimSnapshot } from "./sim-physics";

/**
 * Derive electroscope physics from raw store state with useMemo.
 * Avoids the "new object every render" infinite loop that occurs when
 * calling store.getPhysics() inside a selector.
 */
export function useElectroscopePhysics(): ElectroscopePhysics {
  const externalRodPresent = useSimStore((s) => s.externalRodPresent);
  const rodCharge = useSimStore((s) => s.rodCharge);
  const externalRodDistance = useSimStore((s) => s.externalRodDistance);
  const netCharge = useSimStore((s) => s.netCharge);
  const isGrounded = useSimStore((s) => s.isGrounded);
  const isContact = useSimStore((s) => s.isContact);
  const groundedDuringInduction = useSimStore((s) => s.groundedDuringInduction);
  const inductionRodSign = useSimStore((s) => s.inductionRodSign);

  return useMemo(() => {
    const snapshot: SimSnapshot = {
      externalRodCharge: externalRodPresent ? rodCharge : 0,
      externalRodPresent,
      externalRodDistance,
      netCharge,
      isGrounded,
      isContact,
      groundedDuringInduction,
      inductionRodSign,
    };
    return computeElectroscope(snapshot);
  }, [
    externalRodPresent,
    rodCharge,
    externalRodDistance,
    netCharge,
    isGrounded,
    isContact,
    groundedDuringInduction,
    inductionRodSign,
  ]);
}
