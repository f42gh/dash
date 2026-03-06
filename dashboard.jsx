import { useState, useEffect, useCallback, useRef } from "react";

// ── Time-based theme system ──
const getTimeTheme = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 21) return "evening";
  return "night";
};

const themes = {
  morning: {
    bg: "linear-gradient(160deg, #fdf6e3 0%, #fef9ef 40%, #fff7e6 100%)",
    card: "rgba(255,255,255,0.85)",
    cardBorder: "rgba(230,180,100,0.25)",
    text: "#3d3427",
    textSub: "#8a7a65",
    accent: "#e8a849",
    accentSoft: "rgba(232,168,73,0.12)",
    focusBg: "linear-gradient(135deg, #fff3d6 0%, #ffe8b0 100%)",
    focusBorder: "#e8a849",
    check: "#d4943a",
    danger: "#c45d4a",
    done: "#7aab6d",
    label: "おはよう ☀",
    emoji: "🌅",
  },
  day: {
    bg: "linear-gradient(160deg, #f0f4f8 0%, #e8eef5 40%, #dfe7f0 100%)",
    card: "rgba(255,255,255,0.9)",
    cardBorder: "rgba(120,150,190,0.2)",
    text: "#1a2a3a",
    textSub: "#6b7f95",
    accent: "#4a7fc4",
    accentSoft: "rgba(74,127,196,0.1)",
    focusBg: "linear-gradient(135deg, #e3edf7 0%, #c9ddf2 100%)",
    focusBorder: "#4a7fc4",
    check: "#3a6db5",
    danger: "#c45050",
    done: "#4a9e5c",
    label: "集中タイム 💪",
    emoji: "☀️",
  },
  evening: {
    bg: "linear-gradient(160deg, #2a2438 0%, #342c48 40%, #2e2540 100%)",
    card: "rgba(60,50,80,0.6)",
    cardBorder: "rgba(180,140,220,0.2)",
    text: "#e8dff5",
    textSub: "#a99bc0",
    accent: "#c49aed",
    accentSoft: "rgba(196,154,237,0.12)",
    focusBg: "linear-gradient(135deg, #3d3355 0%, #4a3a6a 100%)",
    focusBorder: "#c49aed",
    check: "#b080e0",
    danger: "#e07070",
    done: "#70c480",
    label: "おつかれさま 🌆",
    emoji: "🌇",
  },
  night: {
    bg: "linear-gradient(160deg, #0f1118 0%, #161822 40%, #111520 100%)",
    card: "rgba(30,33,48,0.8)",
    cardBorder: "rgba(80,100,160,0.2)",
    text: "#c8cfe0",
    textSub: "#6b7590",
    accent: "#6a8fd8",
    accentSoft: "rgba(106,143,216,0.1)",
    focusBg: "linear-gradient(135deg, #1a1e30 0%, #222840 100%)",
    focusBorder: "#6a8fd8",
    check: "#5580c8",
    danger: "#d06060",
    done: "#60b870",
    label: "夜ふかし注意 🌙",
    emoji: "🌙",
  },
};

// ── Storage helpers ──
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const STORAGE_KEY = "dashboard-data";

const defaultData = () => ({
  date: todayKey(),
  focus: "",
  habits: {
    morningRoutine: false,
    studyMinutes: 0,
  },
  todos: [],
  jobHunt: {
    nextDeadline: "",
    nextDeadlineLabel: "",
  },
});

// ── Main Component ──
export default function Dashboard() {
  const [theme, setTheme] = useState(getTimeTheme());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingFocus, setEditingFocus] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [studyInput, setStudyInput] = useState("");
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineLabel, setDeadlineLabel] = useState("");
  const focusRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const t = themes[theme];

  // Theme auto-update
  useEffect(() => {
    const interval = setInterval(() => setTheme(getTimeTheme()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (parsed.date === todayKey()) {
            setData(parsed);
          } else {
            // New day — carry over job hunt deadlines
            const fresh = defaultData();
            fresh.jobHunt = parsed.jobHunt || fresh.jobHunt;
            setData(fresh);
          }
        } else {
          setData(defaultData());
        }
      } catch {
        setData(defaultData());
      }
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    })();
  }, []);

  // Save data
  const save = useCallback(async (newData) => {
    setData(newData);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Save failed:", e);
    }
  }, []);

  // ── Handlers ──
  const updateFocus = (val) => {
    save({ ...data, focus: val });
    setEditingFocus(false);
  };

  const toggleMorning = () => {
    save({
      ...data,
      habits: { ...data.habits, morningRoutine: !data.habits.morningRoutine },
    });
  };

  const addStudyMinutes = () => {
    const mins = parseInt(studyInput);
    if (!isNaN(mins) && mins > 0) {
      save({
        ...data,
        habits: {
          ...data.habits,
          studyMinutes: data.habits.studyMinutes + mins,
        },
      });
      setStudyInput("");
    }
  };

  const addTodo = () => {
    if (newTodo.trim() && data.todos.length < 3) {
      save({
        ...data,
        todos: [
          ...data.todos,
          { id: Date.now(), text: newTodo.trim(), done: false },
        ],
      });
      setNewTodo("");
    }
  };

  const toggleTodo = (id) => {
    save({
      ...data,
      todos: data.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });
  };

  const removeTodo = (id) => {
    save({ ...data, todos: data.todos.filter((t) => t.id !== id) });
  };

  const saveDeadline = () => {
    save({
      ...data,
      jobHunt: {
        nextDeadline: deadlineDate,
        nextDeadlineLabel: deadlineLabel,
      },
    });
    setEditingDeadline(false);
  };

  // ── Computed ──
  const daysUntilDeadline = () => {
    if (!data?.jobHunt?.nextDeadline) return null;
    const diff = Math.ceil(
      (new Date(data.jobHunt.nextDeadline) - new Date()) /
        (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  const completionRate = () => {
    if (!data) return 0;
    let total = 0;
    let done = 0;
    // Morning routine
    total++;
    if (data.habits.morningRoutine) done++;
    // Todos
    data.todos.forEach((t) => {
      total++;
      if (t.done) done++;
    });
    // Study (if > 0)
    if (data.habits.studyMinutes > 0) {
      total++;
      done++;
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div
        style={{
          background: t.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.text,
          fontFamily: "'Noto Sans JP', 'Helvetica Neue', sans-serif",
        }}
      >
        <div style={{ fontSize: "1.5rem", opacity: 0.6 }}>読み込み中...</div>
      </div>
    );
  }

  const rate = completionRate();
  const daysLeft = daysUntilDeadline();

  return (
    <div
      style={{
        background: t.bg,
        minHeight: "100vh",
        fontFamily: "'Noto Sans JP', 'Helvetica Neue', sans-serif",
        color: t.text,
        padding: "24px 16px",
        transition: "background 1.5s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, button { font-family: inherit; }
        input:focus, button:focus { outline: none; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes progressFill {
          from { width: 0%; }
        }
        .card {
          background: ${t.card};
          border: 1px solid ${t.cardBorder};
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .btn {
          background: ${t.accent};
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .btn:hover { opacity: 0.85; transform: scale(1.02); }
        .btn:active { transform: scale(0.98); }
        .btn-ghost {
          background: transparent;
          color: ${t.accent};
          border: 1.5px solid ${t.accent};
        }
        .btn-ghost:hover { background: ${t.accentSoft}; }
        .btn-sm { padding: 5px 12px; font-size: 0.78rem; }
        .btn-danger { background: ${t.danger}; }
        .input {
          background: ${t.accentSoft};
          border: 1.5px solid transparent;
          border-radius: 10px;
          padding: 10px 14px;
          color: ${t.text};
          font-size: 0.9rem;
          width: 100%;
          transition: border-color 0.2s;
        }
        .input:focus { border-color: ${t.accent}; }
        .input::placeholder { color: ${t.textSub}; opacity: 0.6; }
        .check-btn {
          width: 28px; height: 28px;
          border-radius: 8px;
          border: 2px solid ${t.check};
          background: transparent;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          font-size: 14px;
        }
        .check-btn.checked {
          background: ${t.done};
          border-color: ${t.done};
        }
      `}</style>

      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.6s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                color: t.textSub,
                fontWeight: 500,
                letterSpacing: "0.05em",
                marginBottom: 2,
              }}
            >
              {new Date().toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{t.label}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: t.textSub,
                fontWeight: 500,
              }}
            >
              達成率
            </div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: `3px solid ${rate >= 80 ? t.done : rate >= 40 ? t.accent : t.cardBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: rate >= 80 ? t.done : t.text,
                transition: "all 0.5s ease",
              }}
            >
              {rate}%
            </div>
          </div>
        </div>

        {/* ── FOCUS ZONE ── */}
        <div
          className="card"
          style={{
            background: t.focusBg,
            border: `2px solid ${t.focusBorder}`,
            marginBottom: 16,
            animation: mounted ? "fadeSlideIn 0.5s ease" : "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              fontSize: "2rem",
              opacity: 0.15,
            }}
          >
            🎯
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: t.accent,
              marginBottom: 8,
            }}
          >
            今日のフォーカス
          </div>
          {editingFocus ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={focusRef}
                className="input"
                placeholder="今日一番大事なことは？"
                defaultValue={data.focus}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateFocus(e.target.value);
                  if (e.key === "Escape") setEditingFocus(false);
                }}
                autoFocus
                style={{ fontSize: "1.05rem", fontWeight: 500 }}
              />
              <button
                className="btn btn-sm"
                onClick={() => updateFocus(focusRef.current?.value || "")}
              >
                OK
              </button>
            </div>
          ) : (
            <div
              onClick={() => setEditingFocus(true)}
              style={{
                fontSize: data.focus ? "1.2rem" : "1rem",
                fontWeight: data.focus ? 700 : 400,
                color: data.focus ? t.text : t.textSub,
                cursor: "pointer",
                padding: "4px 0",
                minHeight: 32,
                transition: "color 0.2s",
              }}
            >
              {data.focus || "タップして今日のフォーカスを設定 →"}
            </div>
          )}
        </div>

        {/* ── HABITS ── */}
        <div
          className="card"
          style={{
            marginBottom: 16,
            animation: mounted ? "fadeSlideIn 0.6s ease 0.1s both" : "none",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: t.textSub,
              marginBottom: 14,
            }}
          >
            習慣トラッカー
          </div>

          {/* Morning Routine */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <button
              className={`check-btn ${data.habits.morningRoutine ? "checked" : ""}`}
              onClick={toggleMorning}
            >
              {data.habits.morningRoutine ? "✓" : ""}
            </button>
            <div>
              <div style={{ fontWeight: 500, fontSize: "0.92rem" }}>
                朝ルーティン
              </div>
              <div style={{ fontSize: "0.75rem", color: t.textSub }}>
                偵察行動・朝の準備
              </div>
            </div>
          </div>

          {/* Study Time */}
          <div
            style={{
              background: t.accentSoft,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: "0.92rem" }}>
                📚 学習時間
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: t.accent,
                }}
              >
                {data.habits.studyMinutes}
                <span style={{ fontSize: "0.7rem", fontWeight: 400 }}> 分</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[15, 30, 60].map((m) => (
                <button
                  key={m}
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    save({
                      ...data,
                      habits: {
                        ...data.habits,
                        studyMinutes: data.habits.studyMinutes + m,
                      },
                    })
                  }
                  style={{ flex: 1, fontSize: "0.78rem" }}
                >
                  +{m}分
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                className="input"
                type="number"
                placeholder="カスタム（分）"
                value={studyInput}
                onChange={(e) => setStudyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStudyMinutes()}
                style={{ fontSize: "0.82rem", padding: "7px 12px" }}
              />
              <button className="btn btn-sm" onClick={addStudyMinutes}>
                追加
              </button>
            </div>
          </div>
        </div>

        {/* ── TODO ── */}
        <div
          className="card"
          style={{
            marginBottom: 16,
            animation: mounted ? "fadeSlideIn 0.6s ease 0.2s both" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: t.textSub,
              }}
            >
              今日のTODO
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: t.textSub,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {data.todos.length}/3
            </div>
          </div>

          {data.todos.map((todo, i) => (
            <div
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                padding: "6px 0",
              }}
            >
              <button
                className={`check-btn ${todo.done ? "checked" : ""}`}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.done ? "✓" : ""}
              </button>
              <div
                style={{
                  flex: 1,
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  textDecoration: todo.done ? "line-through" : "none",
                  opacity: todo.done ? 0.5 : 1,
                  transition: "all 0.3s",
                }}
              >
                {todo.text}
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: t.textSub,
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  opacity: 0.4,
                  transition: "opacity 0.2s",
                  padding: "4px",
                }}
                onClick={() => removeTodo(todo.id)}
                onMouseEnter={(e) => (e.target.style.opacity = 1)}
                onMouseLeave={(e) => (e.target.style.opacity = 0.4)}
              >
                ✕
              </button>
            </div>
          ))}

          {data.todos.length < 3 && (
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                className="input"
                placeholder={
                  data.todos.length === 0
                    ? "今日やること（最大3つ）"
                    : "追加する..."
                }
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                style={{ fontSize: "0.88rem", padding: "9px 14px" }}
              />
              <button className="btn btn-sm" onClick={addTodo}>
                追加
              </button>
            </div>
          )}

          {data.todos.length === 3 && (
            <div
              style={{
                fontSize: "0.75rem",
                color: t.textSub,
                textAlign: "center",
                marginTop: 4,
                fontStyle: "italic",
              }}
            >
              3つに集中しよう 🎯
            </div>
          )}
        </div>

        {/* ── JOB HUNT DEADLINE ── */}
        <div
          className="card"
          style={{
            animation: mounted ? "fadeSlideIn 0.6s ease 0.3s both" : "none",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: t.textSub,
              marginBottom: 14,
            }}
          >
            就活 — 次の締切
          </div>

          {editingDeadline ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                className="input"
                placeholder="締切の内容（例：CyberAgent ES提出）"
                value={deadlineLabel}
                onChange={(e) => setDeadlineLabel(e.target.value)}
                style={{ fontSize: "0.88rem" }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="input"
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  style={{ fontSize: "0.88rem" }}
                />
                <button className="btn btn-sm" onClick={saveDeadline}>
                  保存
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingDeadline(false)}
                >
                  戻る
                </button>
              </div>
            </div>
          ) : data.jobHunt.nextDeadline ? (
            <div
              onClick={() => {
                setDeadlineDate(data.jobHunt.nextDeadline);
                setDeadlineLabel(data.jobHunt.nextDeadlineLabel);
                setEditingDeadline(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                {data.jobHunt.nextDeadlineLabel || "未設定"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color:
                      daysLeft !== null && daysLeft <= 3
                        ? t.danger
                        : daysLeft !== null && daysLeft <= 7
                          ? t.accent
                          : t.done,
                  }}
                >
                  {daysLeft !== null
                    ? daysLeft <= 0
                      ? "今日！"
                      : daysLeft
                    : "—"}
                </span>
                {daysLeft !== null && daysLeft > 0 && (
                  <span style={{ fontSize: "0.82rem", color: t.textSub }}>
                    日後 （
                    {new Date(data.jobHunt.nextDeadline).toLocaleDateString(
                      "ja-JP",
                      { month: "short", day: "numeric" },
                    )}
                    ）
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() => setEditingDeadline(true)}
              style={{ width: "100%" }}
            >
              + 次の締切を設定
            </button>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: "0.68rem",
            color: t.textSub,
            opacity: 0.5,
          }}
        >
          {t.emoji} テーマ: {theme} — 自動切替中
        </div>
      </div>
    </div>
  );
}
