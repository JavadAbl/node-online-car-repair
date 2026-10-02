// Permission name constants for the factor service (single source of truth).
// The full registry (service + controller + action levels) is derived from
// these maps at startup and published to the auth service's global catalog.

export const SERVICE_PERMISSION = "factor" as const;

//Factor Controller
const FactorController = `${SERVICE_PERMISSION}.FactorController`;
export const FactorControllerPermissions = {
  GetFactors: FactorController + ".GetFactors",
  GetFactorById: FactorController + ".GetFactorById",
  CreateFactor: FactorController + ".CreateFactor",
  UpdateFactor: FactorController + ".UpdateFactor",
  DeleteFactor: FactorController + ".DeleteFactor",
};

//Payment Controller
const PaymentController = `${SERVICE_PERMISSION}.PaymentController`;
export const PaymentControllerPermissions = {
  GetPayments: PaymentController + ".GetPayments",
  GetPaymentById: PaymentController + ".GetPaymentById",
  CreatePayment: PaymentController + ".CreatePayment",
  UpdatePayment: PaymentController + ".UpdatePayment",
  DeletePayment: PaymentController + ".DeletePayment",
};

/**
 * Derive the full permission list for the global catalog:
 *   actions -> values of the controller permission maps
 *   controllers -> actions with the last segment stripped (deduped)
 *   service -> the service-level root permission
 */
export function derivePermissionList(
  service: string,
  actions: string[],
): { name: string; type: "Service" | "Controller" | "Action" }[] {
  const uniqueActions = [...new Set(actions)].sort();
  const controllers = [...new Set(uniqueActions.map((a) => a.split(".").slice(0, -1).join(".")))].sort();

  return [
    { name: service, type: "Service" as const },
    ...controllers.map((name) => ({ name, type: "Controller" as const })),
    ...uniqueActions.map((name) => ({ name, type: "Action" as const })),
  ];
}

/** All action-level permissions of this service (from the maps above). */
export function collectFactorPermissions(): string[] {
  return [...Object.values(FactorControllerPermissions), ...Object.values(PaymentControllerPermissions)];
}
