export const NODE_STATUS = {
  UP: "UP",
  DOWN: "DOWN",
  UNKNOWN: "UNKNOWN",
} as const;

export type NodeStatus = (typeof NODE_STATUS)[keyof typeof NODE_STATUS];
