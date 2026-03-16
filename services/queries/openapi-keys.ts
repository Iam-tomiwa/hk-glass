export const queryKeys = {
  // auto-generated keys
  auth: {
    all: ["auth"] as const,
    list: (params?: any) => [...queryKeys.auth.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.auth.all, "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params?: any) => [...queryKeys.orders.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.orders.all, "detail", id] as const,
    files: (id: string | number) =>
      [...queryKeys.orders.all, "files", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (params?: any) =>
      [...queryKeys.payments.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.payments.all, "detail", id] as const,
  },
  qr: {
    all: ["qr"] as const,
    list: (params?: any) => [...queryKeys.qr.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.qr.all, "detail", id] as const,
  },
  factory: {
    all: ["factory"] as const,
    list: (params?: any) => [...queryKeys.factory.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.factory.all, "detail", id] as const,
    stats: () => [...queryKeys.factory.all, "stats"] as const,
  },
  admin: {
    all: ["admin"] as const,
    list: (params?: any) => [...queryKeys.admin.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.admin.all, "detail", id] as const,
    files: (id: string | number) =>
      [...queryKeys.admin.all, "files", id] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    list: (params?: any) =>
      [...queryKeys.inventory.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.inventory.all, "detail", id] as const,
  },
  devices: {
    all: ["devices"] as const,
    list: (params?: any) => [...queryKeys.devices.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.devices.all, "detail", id] as const,
  },
  default: {
    all: ["default"] as const,
    list: (params?: any) => [...queryKeys.default.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.default.all, "detail", id] as const,
  },
  notifications: {
    staff: ["notifications", "staff"] as const,
    factory: ["notifications", "factory"] as const,
  },
};
