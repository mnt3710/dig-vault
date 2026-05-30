export const translations = {
  en: {
    // Header
    presentedBy: "Presented by",
    lightMode: "Switch to light mode",
    darkMode: "Switch to dark mode",
    breadcrumbHome: "Home",

    // Home page
    homeTagline: "Dig Vault",
    homeHeading: "Thrift store dig judgment + closet management",
    navDigMode: "Dig Mode",
    navClosetMode: "Closet Mode",
    navLogin: "Login",
    homeDigDesc: "Upload an image and get an instant thrift judgment.",
    homeClosetDesc: "Organize saved finds with Firebase-backed storage.",
    homeLoginDesc: "Sign in with Firebase Authentication.",

    // Dig page
    digPageHeading: "Dig Mode",
    digSectionHeading: "Dig Judgment",
    digDescription: "Upload a thrift item photo to get one of:",
    digModeSimple: "Simple",
    digModeDetail: "Detail",
    digModeSimpleDesc: "Upload photos → instant judgment",
    digModeDetailDesc: "Extract item info → review & edit → judgment with links",
    digExtractButton: "Extract item info",
    digExtractLoading: "Extracting...",
    digReviewHeading: "Review & edit item info",
    digReviewSubtext: "Gemini's best guess — correct anything that's wrong before judging.",
    digDetailBrand: "Brand",
    digDetailItemType: "Item type",
    digDetailColor: "Color",
    digDetailEra: "Era",
    digDetailStorePrice: "Store price tag",
    digDetailDiscountRate: "Discount (%)",
    digDetailEstimatedPrice: "Estimated resale price",
    digDetailCondition: "Condition",
    digDetailSearchKeywords: "Search keywords",
    digDetailJudgeButton: "Judge with this info",
    digImageLabel: "Item images (up to 8)",
    digImageAddAnother: "+ Add another photo",
    digImageRemove: "Remove",
    digImageHint: "More angles = higher confidence",
    digSubmitIdle: "Judge this item",
    digSubmitLoading: "Judging...",
    digResultLabel: "Gemini verdict",
    digResultVerdict: "Verdict",
    digResultReason: "Reason",
    digResultCondition: "Condition",
    digResultConfidence: "Confidence",
    digResultConfidenceNote: "Note",
    digResultMarketPrice: "Market price (Mercari)",
    digResultSoldTrend: "Sold trend",
    digResultTags: "Tags",
    digResultPhotoTips: "Tips to improve accuracy",
    digResultSearchLinks: "Find it online",
    digErrorImageSize: "Please upload an image smaller than 5MB.",
    digErrorImageRead: "Failed to read the selected image.",
    digErrorGeneric: "Request failed",
    digErrorJudge: "Judgment request failed",

    // Closet page
    closetPageHeading: "Closet Mode",
    closetSectionHeading: "Closet Mode",
    closetDescription:
      "Keep your best finds organized. Firebase Firestore and Storage are prepared for inventory sync and image storage.",

    // Login
    loginHeading: "Login",
    loginEmailPlaceholder: "Email",
    loginPasswordPlaceholder: "Password",
    loginSubmit: "Sign in",
    loginSubmitLoading: "Signing in...",
    loginSuccess: "Logged in successfully.",
    loginErrorFirebase: "Firebase environment variables are missing. Update .env.local first.",
    loginErrorGeneric: "Login failed",
  },

  ja: {
    // Header
    presentedBy: "Presented by",
    lightMode: "ライトモードに切り替え",
    darkMode: "ダークモードに切り替え",
    breadcrumbHome: "ホーム",

    // Home page
    homeTagline: "Dig Vault",
    homeHeading: "リサイクルショップdig判定 + クローゼット管理アプリ",
    navDigMode: "Digモード",
    navClosetMode: "クローゼット",
    navLogin: "ログイン",
    homeDigDesc: "写真をアップロードして、即座に購入判定を取得。",
    homeClosetDesc: "お気に入りのアイテムをFirebaseで管理・整理。",
    homeLoginDesc: "Firebaseアカウントでサインイン。",

    // Dig page
    digPageHeading: "Digモード",
    digSectionHeading: "アイテム判定",
    digDescription: "商品写真をアップロードして判定を取得:",
    digModeSimple: "シンプル",
    digModeDetail: "詳しい",
    digModeSimpleDesc: "写真を送るだけで即判定",
    digModeDetailDesc: "情報を抽出 → 確認・修正 → リンク付き判定",
    digExtractButton: "アイテム情報を抽出",
    digExtractLoading: "抽出中...",
    digReviewHeading: "アイテム情報を確認・修正",
    digReviewSubtext: "Geminiの推測結果です。間違いがあれば修正してから判定してください。",
    digDetailBrand: "ブランド",
    digDetailItemType: "アイテム種類",
    digDetailColor: "カラー",
    digDetailEra: "年代",
    digDetailStorePrice: "店頭値札価格",
    digDetailDiscountRate: "割引率（%）",
    digDetailEstimatedPrice: "メルカリ推定相場",
    digDetailCondition: "状態",
    digDetailSearchKeywords: "検索キーワード",
    digDetailJudgeButton: "この情報で判定する",
    digImageLabel: "商品画像（最大8枚）",
    digImageAddAnother: "+ 写真を追加",
    digImageRemove: "削除",
    digImageHint: "複数アングルで精度UP",
    digSubmitIdle: "判定する",
    digSubmitLoading: "判定中...",
    digResultLabel: "Gemini判定結果",
    digResultVerdict: "判定",
    digResultReason: "理由",
    digResultCondition: "状態",
    digResultConfidence: "信頼度",
    digResultConfidenceNote: "注意",
    digResultMarketPrice: "相場（メルカリ）",
    digResultSoldTrend: "売れ行きトレンド",
    digResultTags: "タグ",
    digResultPhotoTips: "精度向上の撑影アドバイス",
    digResultSearchLinks: "オンラインで探す",
    digErrorImageSize: "5MB未満の画像をアップロードしてください。",
    digErrorImageRead: "画像の読み込みに失敗しました。",
    digErrorGeneric: "リクエストに失敗しました",
    digErrorJudge: "判定リクエストに失敗しました",

    // Closet page
    closetPageHeading: "クローゼット",
    closetSectionHeading: "クローゼット",
    closetDescription:
      "お気に入りのアイテムを整理しましょう。Firebase FirestoreとStorageで在庫管理・画像保存ができます。",

    // Login
    loginHeading: "ログイン",
    loginEmailPlaceholder: "メールアドレス",
    loginPasswordPlaceholder: "パスワード",
    loginSubmit: "サインイン",
    loginSubmitLoading: "サインイン中...",
    loginSuccess: "ログインしました。",
    loginErrorFirebase: "Firebase環境変数が未設定です。.env.localを更新してください。",
    loginErrorGeneric: "ログインに失敗しました",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
export type Language = "en" | "ja";

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key];
}
