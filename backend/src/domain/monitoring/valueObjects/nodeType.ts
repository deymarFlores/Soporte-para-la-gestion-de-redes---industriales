export const NODE_TYPE = {
  GATEWAY: "GATEWAY",
  PLC: "PLC",
  DEVICE: "DEVICE",
} as const;

export type NodeType = (typeof NODE_TYPE)[keyof typeof NODE_TYPE];
