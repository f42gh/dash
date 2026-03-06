# ew's Personal Dashboard — SPEC.md

## 概要

ADHD特性（衝動性・注意散漫）を考慮した、個人用ダッシュボード。
「今日モード」と「全体俯瞰モード」の2ビューで構成。
日次の意思決定コストを最小化し、フォーカスを強制する設計。

---

## 技術スタック

| 項目 | 選定 |
|------|------|
| フレームワーク | React 18+ |
| 言語 | TypeScript |
| ビルドツール | Vite |
| スタイリング | CSS Modules or Tailwind CSS（要検討） |
| データ永続化 | localStorage（ローカル運用前提） |
| デプロイ先 | GitHub Pages or Vercel |
| フォント | Noto Sans JP + JetBrains Mono |

### ディレクトリ構成（想定）

```
src/
├── components/
│   ├── today/           # 今日モード用コンポーネント
│   │   ├── FocusZone.tsx
│   │   ├── HabitTracker.tsx
│   │   ├── TodoList.tsx
│   │   └── JobHuntDeadline.tsx
│   ├── overview/        # 全体俯瞰モード用コンポーネント
│   │   ├── WeeklyHabits.tsx
│   │   ├── SkillProgress.tsx
│   │   ├── JobHuntTimeline.tsx
│   │   └── CompanyList.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── ModeSwitch.tsx
│   └── shared/
│       ├── Card.tsx
│       ├── CheckButton.tsx
│       └── ProgressRing.tsx
├── hooks/
│   ├── useStorage.ts    # localStorage読み書きフック
│   ├── useTheme.ts      # 時間帯テーマ管理
│   └── useToday.ts      # 日付変更検知
├── types/
│   └── index.ts         # 全型定義
├── utils/
│   ├── storage.ts       # ストレージユーティリティ
│   ├── date.ts          # 日付ヘルパー
│   └── theme.ts         # テーマ定義
├── App.tsx
├── main.tsx
└── index.css
```

---

## ビュー構成

### 1. 今日モード（デフォルト表示）

日次で最も頻繁に触るビュー。認知負荷を最小化する。

#### 1-1. 今日のフォーカス（最上部・最大面積）

- **目的**: 「今日一番大事なこと」を1つだけ宣言する
- **表示**: カード中央にテキスト大きく表示
- **操作**: クリック/タップで編集、Enter確定、Escape取消
- **ADHD設計意図**: 並列タスクを見せず、1点集中を強制する

#### 1-2. 習慣トラッカー

追跡項目（2つ、固定）:

| 項目 | 入力方式 | 表示 |
|------|----------|------|
| 朝ルーティン（偵察行動含む） | チェックボックス（ON/OFF） | ✓ or 未 |
| 学習時間 | クイックボタン（+15/30/60分）+ カスタム入力 | 累計N分 |

- 日付が変わるとリセット

#### 1-3. TODO（上限3個）

- **上限**: 3個（ハードリミット）
- **操作**: テキスト入力で追加、チェックで完了、✕で削除
- **3個到達時**: 入力欄非表示 + 「3つに集中しよう 🎯」メッセージ
- **ADHD設計意図**: 選択肢を制限して決断疲れを防ぐ
- 日付が変わるとリセット

#### 1-4. 就活 — 次の締切

- **表示**: 締切内容ラベル + 残り日数（大きく）+ 日付
- **色分け**: 3日以内=赤、7日以内=アクセント色、それ以上=緑
- **操作**: クリックで編集（日付 + ラベル入力）
- 日付が変わっても引き継ぐ

#### 1-5. ヘッダー

- 日付表示（YYYY年M月D日（曜日））
- 時間帯挨拶テキスト
- 達成率リング（習慣+TODO+学習の複合計算）

### 2. 全体俯瞰モード（未実装 → Phase 2）

週〜月単位の進捗を確認するビュー。

#### 2-1. 習慣の週間ビュー

- 7日分のグリッド表示（GitHub Contributionsスタイル）
- 朝ルーティン達成 + 学習時間の2行

#### 2-2. 学習進捗（スキルマップ）

- AtCoder: 解いた問題数、レーティング推移（手動入力 or API連携）
- 技術スキル: 言語・ツール別の進捗バー（自己評価）
  - Python, R, C/C++, TypeScript, SQL, Git

#### 2-3. 就活タイムライン

5フェーズの横型タイムライン:

| Phase | 期間 | 内容 |
|-------|------|------|
| 1. 準備 | 〜2026/05 | ポートフォリオ + TypeScript製品1つ |
| 2. サマー応募 | 2026/06-07 | インターン応募 |
| 3. サマー参加 | 2026/08-09 | インターン |
| 4. 秋冬 | 2026/10-2027/02 | 秋冬インターン + 早期選考 |
| 5. 本選考 | 2027/03-06 | 本選考 |

- 現在フェーズをハイライト
- 各フェーズにマイルストーン設定可能

#### 2-4. 企業リスト

Tier分けされた企業管理:

| Tier | 企業例 |
|------|--------|
| Tier 1: 本命 | Dwango, Recruit, CyberAgent, DeNA, LY Corp |
| Tier 2: GenAI/データ基盤 | PFN, BrainPad, Treasure Data, Stockmark |
| Tier 3: SaaS | freee, Sansan, SmartHR, MoneyForward |
| Tier 4: EdTech隣接 | atama plus, Ubie, StudySapuri, LayerX |

各企業に対して:
- ステータス（未着手/ES準備中/面接中/内定/辞退）
- 次のアクション
- 締切日
- メモ

---

## テーマシステム

時間帯で自動切替（1分間隔でチェック）:

| 時間帯 | テーマ名 | 基調 | 挨拶 |
|--------|----------|------|------|
| 05:00–09:59 | morning | 暖色・ベージュ系 | おはよう ☀ |
| 10:00–16:59 | day | 寒色・ブルーグレー系 | 集中タイム 💪 |
| 17:00–20:59 | evening | 紫・ダーク系 | おつかれさま 🌆 |
| 21:00–04:59 | night | ダーク・ネイビー系 | 夜ふかし注意 🌙 |

各テーマで定義するCSS変数:
- `--bg` (背景グラデーション)
- `--card` (カード背景)
- `--card-border`
- `--text` / `--text-sub`
- `--accent` / `--accent-soft`
- `--focus-bg` / `--focus-border`
- `--check` / `--done` / `--danger`

テーマ切替はCSS transitionで滑らかに（1.5s ease）。

---

## データモデル

### DailyData（日次データ、日付変更でリセット）

```typescript
interface DailyData {
  date: string;             // "YYYY-MM-DD"
  focus: string;            // 今日のフォーカス（1つ）
  habits: {
    morningRoutine: boolean;  // 朝ルーティン達成
    studyMinutes: number;     // 学習時間（分）
  };
  todos: Todo[];            // 最大3件
}

interface Todo {
  id: number;               // Date.now()
  text: string;
  done: boolean;
}
```

### PersistentData（日付跨ぎで保持）

```typescript
interface PersistentData {
  jobHunt: {
    nextDeadline: string;     // "YYYY-MM-DD"
    nextDeadlineLabel: string; // "CyberAgent ES提出"
  };
  companies: Company[];       // Phase 2
  timeline: TimelinePhase[];  // Phase 2
  weeklyHistory: DailyData[]; // 直近7日分のアーカイブ（Phase 2）
  skills: SkillEntry[];       // Phase 2
}

// Phase 2 の型（先に定義しておく）
interface Company {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  status: "未着手" | "ES準備中" | "面接中" | "内定" | "辞退";
  nextAction: string;
  deadline: string;
  memo: string;
}

interface SkillEntry {
  name: string;             // "Python", "TypeScript", etc.
  category: "language" | "tool" | "framework";
  level: number;            // 1-5 自己評価
  notes: string;
}

interface TimelinePhase {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  milestones: string[];
}
```

### ストレージ戦略

```
localStorage keys:
  "dashboard-daily"       → DailyData (JSON)
  "dashboard-persistent"  → PersistentData (JSON)
```

- アプリ起動時に`dashboard-daily`の`date`を確認
- 今日と異なれば:
  - 古いDailyDataをPersistentDataの`weeklyHistory`にpush（Phase 2）
  - 新しいDailyDataを生成（フォーカス・習慣・TODOリセット）
  - jobHuntはPersistentDataから読む

---

## ADHD対策設計原則

1. **フォーカスの強制**: 画面最上部・最大面積で「今日の1つ」を表示
2. **選択肢の制限**: TODO上限3、締切表示は次の1件のみ
3. **認知負荷の分離**: 今日モード（日次タスク） vs 俯瞰モード（戦略的判断）
4. **即時フィードバック**: チェック時のアニメーション、達成率リングの変動
5. **起動障壁の最小化**: 開いたら今日モードが即表示、入力はクリック1つで開始
6. **情報の段階的開示**: 全体俯瞰は明示的な切替操作が必要（勝手に見えない）

---

## 実装フェーズ

### Phase 1（現在 → 最優先）
- [x] 今日モード — フォーカスゾーン
- [x] 今日モード — 習慣トラッカー（朝ルーティン + 学習時間）
- [x] 今日モード — TODO（上限3）
- [x] 今日モード — 就活次の締切
- [x] 時間帯テーマ自動切替
- [x] データ永続化
- [ ] Vite + React + TypeScript環境構築
- [ ] プロトタイプJSXからの移植・コンポーネント分割

### Phase 2（全体俯瞰モード）
- [ ] モード切替UI
- [ ] 習慣の週間ビュー
- [ ] 学習スキルマップ
- [ ] 就活タイムラインビジュアル
- [ ] 企業リスト管理

### Phase 3（拡張）
- [ ] AtCoder API連携（レーティング自動取得）
- [ ] PWA化（オフライン対応 + ホーム画面追加）
- [ ] データのエクスポート/インポート
- [ ] モバイル最適化

---

## 参考: プロトタイプコード

Phase 1の動作プロトタイプが `dashboard.jsx` として存在。
Claude Artifact環境向けに1ファイルで書かれているため、
移植時にコンポーネント分割 + TypeScript型付けが必要。

主要な移植ポイント:
- `window.storage` API → `localStorage` に置換
- インラインスタイル → CSS Modules or Tailwind に移行
- テーマ定義 → `utils/theme.ts` に抽出
- 各セクション → 個別コンポーネントに分割
