import type { NodeResponseDTO, NodeType } from "../types/monitoring.js";
import { StatusBadge } from "./StatusBadge.js";

interface TreeNode extends NodeResponseDTO {
  children: TreeNode[];
}

function buildForest(nodes: NodeResponseDTO[]): TreeNode[] {
  const byId = new Map<string, TreeNode>(nodes.map((node) => [node.id, { ...node, children: [] }]));
  const roots: TreeNode[] = [];

  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

const TYPE_LABEL: Record<NodeType, string> = {
  GATEWAY: "Gateway",
  PLC: "PLC",
  DEVICE: "Dispositivo",
};

function ChainCard({ node }: { node: TreeNode }) {
  return (
    <div className="flex min-w-[180px] flex-col gap-2 rounded-lg border border-border bg-surface-raised px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-ink-muted">{TYPE_LABEL[node.type]}</span>
      <span className="font-medium text-ink">{node.name}</span>
      {node.ip && <span className="font-mono text-xs text-ink-muted">{node.ip}</span>}
      <StatusBadge status={node.currentStatus} />
    </div>
  );
}

function ChainBranch({ node }: { node: TreeNode }) {
  return (
    <div className="flex items-center gap-3">
      <ChainCard node={node} />
      {node.children.length > 0 && (
        <>
          <span aria-hidden className="text-ink-muted">
            →
          </span>
          <div className="flex flex-col gap-3">
            {node.children.map((child) => (
              <ChainBranch key={child.id} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function SegmentChain({ nodes }: { nodes: NodeResponseDTO[] }) {
  const forest = buildForest(nodes);

  if (forest.length === 0) {
    return <p className="text-ink-muted">Todavía no hay nodos registrados.</p>;
  }

  return (
    <div className="flex flex-col gap-4 overflow-x-auto pb-2">
      {forest.map((root) => (
        <ChainBranch key={root.id} node={root} />
      ))}
    </div>
  );
}
