export const ACCESS_SESSION_STATUS = {
  ACTIVE: "ACTIVE",
  ENDED: "ENDED",
  EXPIRED: "EXPIRED",
} as const;

export type AccessSessionStatus = (typeof ACCESS_SESSION_STATUS)[keyof typeof ACCESS_SESSION_STATUS];
