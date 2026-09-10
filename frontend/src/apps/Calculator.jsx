import React, { useEffect, useState } from "react";
import { Delete, History, RotateCcw } from "lucide-react";

const keys = [
  ["AC", "action"],
  ["⌫", "action"],
  ["%", "operator"],
  ["÷", "operator"],
  ["7", "number"],
  ["8", "number"],
  ["9", "number"],
  ["×", "operator"],
  ["4", "number"],
  ["5", "number"],
  ["6", "number"],
  ["−", "operator"],
  ["1", "number"],
  ["2", "number"],
  ["3", "number"],
  ["+", "operator"],
  ["0", "zero"],
  [".", "number"],
  ["=", "equals"],
];

function calculate(a, op, b) {
  const x = Number(a),
    y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return "Error";
  if (op === "+") return x + y;
  if (op === "−") return x - y;
  if (op === "×") return x * y;
  if (op === "÷") return y === 0 ? "Error" : x / y;
  return y;
}

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [history, setHistory] = useState([]);

  const inputDigit = (digit) => {
    if (display === "Error") return clear();
    if (waiting) {
      setDisplay(digit);
      setWaiting(false);
      return;
    }
    setDisplay(display === "0" ? digit : display + digit);
  };

  const inputDecimal = () => {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const chooseOperator = (nextOperator) => {
    const input = Number(display);
    if (!Number.isFinite(input)) return;

    if (stored !== null && operator && !waiting) {
      const result = calculate(stored, operator, input);
      setDisplay(String(result));
      setStored(result);
    } else {
      setStored(input);
    }

    setOperator(nextOperator);
    setWaiting(true);
  };

  const equals = () => {
    if (stored === null || !operator || waiting) return;
    const result = calculate(stored, operator, Number(display));
    const expression = `${stored} ${operator} ${display} = ${result}`;

    setDisplay(String(result));
    setHistory((current) =>
      [{ id: Date.now(), expression }, ...current].slice(0, 10),
    );
    setStored(null);
    setOperator(null);
    setWaiting(true);
  };

  const clear = () => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setWaiting(false);
  };

  const backspace = () => {
    if (waiting || display === "Error") return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  };

  const percent = () => {
    const value = Number(display);
    if (Number.isFinite(value)) setDisplay(String(value / 100));
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
      else if (e.key === ".") inputDecimal();
      else if (e.key === "+") chooseOperator("+");
      else if (e.key === "-") chooseOperator("−");
      else if (e.key === "*") chooseOperator("×");
      else if (e.key === "/") {
        e.preventDefault();
        chooseOperator("÷");
      } else if (e.key === "Enter" || e.key === "=") equals();
      else if (e.key === "Escape") clear();
      else if (e.key === "Backspace") backspace();
      else if (e.key === "%") percent();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="flex h-full w-full bg-slate-950 text-white">
      <section className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-white/50">Calculator</span>
          <button
            onClick={clear}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10"
            title="Clear"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="mb-4 flex min-h-[82px] items-end justify-end overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="max-w-full truncate text-right text-4xl font-light tracking-tight">
            {display}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-4 gap-2">
          {keys.map(([key, type]) => (
            <button
              key={key}
              onClick={() => {
                if (type === "number" || type === "zero")
                  key === "." ? inputDecimal() : inputDigit(key);
                else if (type === "operator") chooseOperator(key);
                else if (type === "equals") equals();
                else if (key === "AC") clear();
                else if (key === "⌫") backspace();
                else if (key === "%") percent();
              }}
              className={`rounded-xl text-sm font-semibold transition active:scale-95 ${
                type === "operator"
                  ? "bg-violet-700/80 hover:bg-violet-600"
                  : type === "equals"
                    ? "bg-blue-600 hover:bg-blue-500"
                    : type === "action"
                      ? "bg-white/10 hover:bg-white/15"
                      : type === "zero"
                        ? "col-span-2 bg-white/10 hover:bg-white/15"
                        : "bg-white/10 hover:bg-white/15"
              }`}
            >
              {key === "⌫" ? <Delete size={18} className="mx-auto" /> : key}
            </button>
          ))}
        </div>
      </section>

      <aside className="hidden w-[180px] flex-none border-l border-white/10 bg-white/[0.03] p-3 sm:block">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/80">
          <History size={15} /> History
        </div>
        <div className="space-y-2 overflow-auto">
          {history.length ? (
            history.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-white/5 p-2 text-[10px] leading-4 text-white/65"
              >
                {item.expression}
              </div>
            ))
          ) : (
            <p className="text-[10px] leading-4 text-white/35">
              Your calculations will appear here.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

export default Calculator;
