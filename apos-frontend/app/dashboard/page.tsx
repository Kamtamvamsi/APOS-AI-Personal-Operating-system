"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";



interface Task {
  task_id: string;
  title: string;
  status: string;
}

interface Goal {
  goal_id: string;
  title: string;
  tasks: Task[];
}

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [taskInput, setTaskInput] = useState<any>({});

  // 🔥 TIMER SYSTEM
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState(0);

  // 📊 SUMMARY + REFLECTION
  const [summary, setSummary] = useState<any>(null);
  const [reflection, setReflection] = useState("");

  // 🔐 AUTH
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
    } else {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      fetchGoals(parsed.email);
      fetchToday();
    }
  }, []);

  // ⏱️ TIMER
  useEffect(() => {
    let interval: any;

    if (activeTask) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeTask]);

  // 📥 FETCH GOALS
  const fetchGoals = async (email: string) => {
    const res = await axios.post("http://localhost:8000/get-goals", {
      user_email: email,
    });
    setGoals(res.data.goals || []);
  };

  // 📥 FETCH TODAY DATA
  const fetchToday = async () => {
    const res = await fetch("http://localhost:5000/get-today");
    const data = await res.json();

    setSummary(data.summary || {});
  };

  // ➕ ADD GOAL
  const addGoal = async () => {
    if (!newGoal.trim()) return;

    await axios.post("http://localhost:8000/add-goal", {
      user_email: user.email,
      title: newGoal,
    });

    setNewGoal("");
    fetchGoals(user.email);
  };

  // ➕ ADD TASK
  const addTask = async (goalId: string) => {
    if (!taskInput[goalId]?.trim()) return;

    await axios.post("http://localhost:8000/add-task", {
      goal_id: goalId,
      title: taskInput[goalId],
    });

    setTaskInput({ ...taskInput, [goalId]: "" });
    fetchGoals(user.email);
  };

  // ▶️ START TASK
  const startTask = async (task: Task) => {
    await fetch("http://localhost:5000/start-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    setActiveTask(task);
    setTimer(0);
  };

  // ⏹️ COMPLETE TASK
  const completeTask = async () => {
    if (!activeTask) return;

    await fetch("http://localhost:5000/complete-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...activeTask,
        actual_duration: timer,
      }),
    });

    setActiveTask(null);
    setTimer(0);
    fetchToday();
  };

  // 💾 SAVE REFLECTION
  const saveReflection = async () => {
    await fetch("http://localhost:5000/save-reflection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reflection }),
    });

    alert("Saved!");
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">

        {/* 👋 HEADER */}
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {user?.name || user?.email}
        </h1>

        {/* 🧠 AI INSIGHT */}
        <div className="bg-white border p-6 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">AI Insight</h2>
          <p className="text-gray-700">
            You lose focus after 2 tasks. Evenings are inconsistent.
          </p>
        </div>

        {/* 🎯 NEXT MOVE */}
        <div className="bg-black text-white p-6 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Next Move</h2>
          <p>Start your highest priority task now.</p>
        </div>

        {/* ⏱ ACTIVE TASK */}
        {activeTask && (
          <div className="border p-4 mb-6 rounded bg-gray-50">
            <h2 className="font-semibold">{activeTask.title}</h2>
            <p className="text-gray-700">
              Time: {Math.floor(timer / 60)}m {timer % 60}s
            </p>

            <button
              onClick={completeTask}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
            >
              Complete Task
            </button>
          </div>
        )}

        {/* ➕ ADD GOAL */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Add Goal</h2>

          <div className="flex gap-2">
            <input
              placeholder="e.g. Crack AI Job"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="border p-2 rounded w-full text-black placeholder-gray-500"
            />

            <button
              onClick={addGoal}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Add
            </button>
          </div>
        </div>

        {/* 📋 GOALS */}
        {goals.map((goal) => (
          <div key={goal.goal_id} className="border p-4 mb-4 rounded">

            <h3 className="font-bold text-lg mb-2">{goal.title}</h3>

            {goal.tasks.map((task) => (
              <div
                key={task.task_id}
                className="flex justify-between mb-2"
              >
                <span>
                  {task.title} {task.status === "completed" ? "✅" : "❌"}
                </span>

                <button
                  onClick={() => startTask(task)}
                  className="bg-blue-500 text-white px-2 rounded"
                >
                  Start
                </button>
              </div>
            ))}

            {/* ADD TASK */}
            <div className="flex gap-2 mt-3">
              <input
                placeholder="New Task"
                value={taskInput[goal.goal_id] || ""}
                onChange={(e) =>
                  setTaskInput({
                    ...taskInput,
                    [goal.goal_id]: e.target.value,
                  })
                }
                className="border p-2 rounded w-full text-black placeholder-gray-500"
              />

              <button
                onClick={() => addTask(goal.goal_id)}
                className="bg-green-600 text-white px-3 rounded"
              >
                Add
              </button>
            </div>

          </div>
        ))}

        {/* 📊 SUMMARY */}
        {summary && (
          <div className="border p-4 rounded mb-6">
            <h2 className="text-xl font-semibold mb-2">Today Summary</h2>
            <p>Completion: {summary.completion_rate || 0}%</p>
            <p>Total Time: {summary.total_time || 0}s</p>
          </div>
        )}

        {/* 🧠 REFLECTION */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Reflection</h2>

          <textarea
            className="w-full border p-2 rounded text-black"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />

          <button
            onClick={saveReflection}
            className="mt-2 bg-purple-600 text-white px-3 py-1 rounded"
          >
            Save Reflection
          </button>
        </div>

      </div>
    </div>
  );
}