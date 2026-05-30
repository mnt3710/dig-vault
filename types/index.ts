export const JUDGMENT_VALUES = ["GRAB", "BUY", "HOLD", "PASS", "TRY"] as const;

export type Judgment = (typeof JUDGMENT_VALUES)[number];

export type JudgeMode = "simple" | "detail";

/** 詳しいモード Step 1 で抽出するアイテム情報 */
export interface ItemDetails {
  brand: string;
  itemType: string;
  color: string;
  era?: string;
  storePrice?: string;     // お店がつけた値札の価格（写真から読み取れた場合のみ）
  discountRate?: number;   // 割引率 0–100（ユーザー入力）
  estimatedPrice: string;
  condition: string;
  searchKeywords: string;
}

export interface SearchLink {
  label: string;  // e.g. "Mercari", "Rakuma", "ZOZOUSED", "公式ショップ"
  url: string;
}

export interface JudgeResult {
  judgment: Judgment;
  reason: string;
  condition?: string;        // e.g. "Good", "Fair", "Poor"
  tags?: string[];           // e.g. ["vintage", "denim", "branded"]
  confidence?: number;       // 0.0–1.0 判定の信頼度
  confidenceNote?: string;   // 信頼度が低い場合の理由
  marketPrice?: string;      // 相場帯（Google検索グラウンディング結果から取得）
  soldTrend?: string;        // 売れ行きトレンド
  photoTips?: string[];      // 精度向上の撮影アドバイス
  searchLinks?: SearchLink[]; // 関連リンク（メルカリ・ラクマ・新品など）
}

