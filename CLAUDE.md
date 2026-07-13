@AGENTS.md

# プロジェクト固有ルール

- 用途: 自己啓発書の学びを行動化・習慣化するアプリ。詳細は requirements.md を必ず読むこと
- アクションの状態は active / stock / mastered の3値。activeは常に最大3個（この制約を壊す変更は禁止）
- 「今日やった」チェックは1日1回。lastDoneDate（YYYY-MM-DD）で制御し、同日再タップは取り消し
- 殿堂入りの閾値は30回。変更はRyuの承認を得る
- データはlocalStorage（キー: dokusho-action-note）のみ。サーバー・DB・ログインは導入しない
- 表紙取得はGoogle Books API（キー不要）。失敗しても本の登録は止めない
- モバイル最優先。UI変更後は必ず375px幅で動作確認する
- コミットメッセージは日本語1行
