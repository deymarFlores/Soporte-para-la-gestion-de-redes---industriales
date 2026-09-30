export const USER_ROLE = {
  ADMINISTRADOR: "ADMINISTRADOR",
  SOPORTE: "SOPORTE",
  CONSULTA: "CONSULTA",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
