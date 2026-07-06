export type VehicleType = "car" | "motorcycle";

export type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  type: VehicleType;
  createdAt: string;
};
