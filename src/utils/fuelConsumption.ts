import type { FuelRecord } from "../types";

export type FuelConsumptionStats = {
  totalDistanceKm: number;
  totalLiter: number;
  averageByDistanceWindow: number | null;
  lastRefillConsumption: number | null;
  lastRefillDistanceKm: number | null;
  latestOdometer: number | null;
};

export function getFuelConsumptionStats(fuels: FuelRecord[], windowKm = 500): FuelConsumptionStats {
  const validFuelRecords = [...fuels]
    .filter(
      (fuel) =>
        fuel &&
        Number.isFinite(fuel.odometer) &&
        fuel.odometer > 0 &&
        Number.isFinite(fuel.liter) &&
        fuel.liter > 0
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalDistanceKm = 0;
  let totalLiter = 0;

  for (let i = 1; i < validFuelRecords.length; i += 1) {
    const previous = validFuelRecords[i - 1];
    const current = validFuelRecords[i];
    const distance = Math.max(0, current.odometer - previous.odometer);

    if (distance > 0) {
      totalDistanceKm += distance;
      totalLiter += current.liter;
    }
  }

  let lastRefillDistanceKm: number | null = null;
  let lastRefillConsumption: number | null = null;

  if (validFuelRecords.length >= 2) {
    const current = validFuelRecords[validFuelRecords.length - 1];
    const previous = validFuelRecords[validFuelRecords.length - 2];
    const distance = Math.max(0, current.odometer - previous.odometer);

    if (distance > 0 && current.liter > 0) {
      lastRefillDistanceKm = distance;
      lastRefillConsumption = Number((distance / current.liter).toFixed(1));
    }
  }

  let rollingDistance = 0;
  let rollingLiter = 0;

  for (let i = validFuelRecords.length - 1; i > 0; i -= 1) {
    const current = validFuelRecords[i];
    const previous = validFuelRecords[i - 1];
    const distance = Math.max(0, current.odometer - previous.odometer);

    if (distance <= 0) continue;

    rollingDistance += distance;
    rollingLiter += current.liter;

    if (rollingDistance >= windowKm) {
      break;
    }
  }

  const averageByDistanceWindow = rollingDistance > 0 && rollingLiter > 0
    ? Number((rollingDistance / rollingLiter).toFixed(1))
    : null;

  return {
    totalDistanceKm,
    totalLiter,
    averageByDistanceWindow,
    lastRefillConsumption,
    lastRefillDistanceKm,
    latestOdometer: validFuelRecords.length > 0 ? validFuelRecords[validFuelRecords.length - 1].odometer : null,
  };
}
