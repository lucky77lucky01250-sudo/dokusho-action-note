# プロジェクト固有ルール

- 用途: 自己啓発書の学びを行動化・習慣化するアプリ。詳細は requirements.md を必ず読むこと
- アクションの状態は active / stock / mastered の3値。activeは常に最大3個（この制約を壊す変更は禁止）
- 「今日やった」チェックは1日1回。lastDoneDate（YYYY-MM-DD）で制御し、同日再タップは取り消し
- 殿堂入りの閾値は30回。変更はRyuの承認を得る
- アプリのデータはlocalStorage（キー: dokusho-action-note）のみ。DB・ログイン・端末間同期は導入しない。唯一の例外は表紙取得の /api/cover（外部APIを叩くだけの無状態なRoute Handler。データは保存しない。2026-11 Ryu承認済み）
- 表紙取得はサーバー側 /api/cover 経由でGoogle Books APIをキー付きで呼ぶ（キーは環境変数 GOOGLE_BOOKS_API_KEY に置く。コードに書かない）。ISBN検索にも対応。失敗しても本の登録は止めない
- モバイル最優先。UI変更後は必ず375px幅で動作確認する
- コミットメッセージは日本語1行

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
