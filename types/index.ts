export const JUDGMENT_VALUES = ["GRAB", "BUY", "HOLD", "PASS", "TRY"] as const;

export type Judgment = (typeof JUDGMENT_VALUES)[number];

export interface JudgeResult {
  judgment: Judgment;
  reason: string;
}
