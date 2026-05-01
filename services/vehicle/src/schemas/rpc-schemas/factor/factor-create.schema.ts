export interface FactorCreate {
  customerId: number;
  items: { quantity: number; serviceId: number }[];
}
