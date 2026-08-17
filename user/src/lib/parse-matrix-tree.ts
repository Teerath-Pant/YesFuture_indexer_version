import type { SlotType, LevelDataXGold } from "@/components/matrix-level-card-x-gold";

export interface ApiMatrixElement {
  user_id?: number;
  level: number;
  place: number;
  active: boolean;
  overflow?: "top" | "bottom";
  is_stored_coin?: boolean;
  is_leading_gift?: boolean;
  is_reinvest?: boolean;
  transaction_hash?: string;
  elements?: ApiMatrixElement[];
}

/** Poora ek level ka backend response (jaisa aapne bheja) */
export interface ApiMatrixLevel {
  title: string;
  level: number;
  max_active_level: number;
  user_id: number;
  cycle: number;
  recycles: number;
  descendants: number;
  currency: string;
  revenue: number;
  revenue_count: number;
  ref_bonus_revenue: number;
  missed_revenue: number;
  missed_partners: number;
  overtake: number;
  freeze: boolean;
  active: boolean;
  elements: ApiMatrixElement[];
  upline_id: number;
  blockchain_last_block_number: number;
}

/** Ek node ko uske rendering slot-type me convert karta hai */
function elementToSlot(el: ApiMatrixElement | undefined): SlotType {
  if (!el || el.active === false) return "empty";
  if (el.is_leading_gift) return "gift";
  if (el.overflow === "top") return "spilloverAbove";
  if (el.overflow === "bottom") return "spilloverBelow";
  return "direct";
}
export function buildTreeRows(
  rootElements: ApiMatrixElement[] | undefined,
  depth = 4
): SlotType[][] {
  const rows: SlotType[][] = [];
  let currentLevel: (ApiMatrixElement | undefined)[] = rootElements ?? [];

  for (let d = 0; d < depth; d++) {
    const rowWidth = currentLevel.length || 2 ** (d + 1);
    const row: SlotType[] = [];
    const nextLevel: (ApiMatrixElement | undefined)[] = [];

    for (let i = 0; i < rowWidth; i++) {
      const node = currentLevel[i];
      row.push(elementToSlot(node));

      const children = node?.elements ?? [];
      nextLevel.push(children[0]);
      nextLevel.push(children[1]);
    }

    rows.push(row);
    currentLevel = nextLevel;
  }

  return rows;
}

export interface TreeNode {
  id?: string;
  slot: SlotType;
}

function elementToNode(el: ApiMatrixElement | undefined): TreeNode {
  return { id: el?.user_id != null ? String(el.user_id) : undefined, slot: elementToSlot(el) };
}
export function buildDetailedTreeRows(
  rootElements: ApiMatrixElement[] | undefined,
  depth = 4
): TreeNode[][] {
  const rows: TreeNode[][] = [];
  let currentLevel: (ApiMatrixElement | undefined)[] = rootElements ?? [];

  for (let d = 0; d < depth; d++) {
    const rowWidth = currentLevel.length || 2 ** (d + 1);
    const row: TreeNode[] = [];
    const nextLevel: (ApiMatrixElement | undefined)[] = [];

    for (let i = 0; i < rowWidth; i++) {
      const node = currentLevel[i];
      row.push(elementToNode(node));
      const children = node?.elements ?? [];
      nextLevel.push(children[0]);
      nextLevel.push(children[1]);
    }

    rows.push(row);
    currentLevel = nextLevel;
  }

  return rows;
}

export function apiLevelToCardData(
  apiLevel: ApiMatrixLevel,
  price: number,
  depth = 4
): LevelDataXGold {
  return {
    level: apiLevel.level,
    price,
    isUnlocked: apiLevel.active,
    tree: buildTreeRows(apiLevel.elements, depth),
    partnersCount: apiLevel.descendants,
    recycleCount: apiLevel.recycles,
  };
}
export function lockedLevelData(level: number, price: number): LevelDataXGold {
  return { level, price, isUnlocked: false, tree: [] };
}
