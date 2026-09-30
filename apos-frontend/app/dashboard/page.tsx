"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";

interface Task {
  task_id: string;
  title: string;
  status: string;
  priority?: "high" | "medium" | "low";
  due_date?: string | null;
  estimated_minutes?: number;
}

interface Goal {
  goal_id: string;
  title: string;
  tasks: Task[];
}

interface WeeklyData {
  day: string;
  completed: number;
}

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [taskInput, setTaskInput] = useState<any>({});

  // TIMER
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState(0);

  // SUMMARY
  const [summary, setSummary] = useState<any>(null);

  // REFLECTION
  const [reflection, setReflection] = useState("");

  // ANALYTICS
  const [streak, setStreak] = useState(0);
  const [skippedTasks, setSkippedTasks] = useState(0);

  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([
    { day: "M", completed: 0 },
    { day: "T", completed: 0 },
    { day: "W", completed: 0 },
    { day: "T", completed: 0 },
    { day: "F", completed: 0 },
    { day: "S", completed: 0 },
    { day: "S", completed: 0 },
  ]);

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(storedUser);

    setUser(parsed);

    fetchGoals(parsed.email);
    fetchToday();
    fetchAnalytics(parsed.email);
  }, [router]);

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (activeTask) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTask]);

  // --------------------------------------------------
  // FETCH GOALS
  // --------------------------------------------------

  const fetchGoals = async (email: string) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/get-goals",
        {
          user_email: email,
        }
      );

      setGoals(res.data.goals || []);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  };

  // --------------------------------------------------
  // FETCH TODAY
  // --------------------------------------------------

  const fetchToday = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/get-today"
      );

      const data = await res.json();

      setSummary(data.summary || {});
    } catch (error) {
      console.error("Failed to fetch today's data:", error);
    }
  };

  // --------------------------------------------------
  // FETCH ANALYTICS
  // --------------------------------------------------

const fetchAnalytics = async (email: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/dashboard-analytics?user_email=${encodeURIComponent(
        email
      )}`
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    setStreak(data.streak || 0);

    setSkippedTasks(
      data.skipped_tasks || 0
    );

    if (data.weekly_activity) {
      setWeeklyData(
        data.weekly_activity
      );
    }

  } catch (error) {
    console.error(
      "Failed to fetch analytics:",
      error
    );
  }
};

  // const fetchAnalytics = async (email: string) => {
  //   try {
  //     const res = await fetch(
  //       `http://localhost:5000/dashboard-analytics?user_email=${encodeURIComponent(
  //         email
  //       )}`
  //     );

  //     if (!res.ok) return;

  //     const data = await res.json();

  //     setStreak(data.streak || 0);
  //     setSkippedTasks(data.skipped_tasks || 0);
  //     setWeeklyData(
  //       data.weekly_activity || weeklyData
  //     );
  //   } catch (error) {
  //     /*
  //       Analytics endpoint can be added later.

  //       We intentionally don't invent historical
  //       behavioral data on the frontend.
  //     */

  //     console.log("Analytics endpoint not available yet.");
  //   }
  // };

  // --------------------------------------------------
  // ADD GOAL
  // --------------------------------------------------

  const addGoal = async () => {
    if (!newGoal.trim() || !user) return;

    try {
      await axios.post(
        "http://localhost:8000/add-goal",
        {
          user_email: user.email,
          title: newGoal,
        }
      );

      setNewGoal("");

      fetchGoals(user.email);
    } catch (error) {
      console.error("Failed to add goal:", error);
    }
  };

  // --------------------------------------------------
  // ADD TASK
  // --------------------------------------------------

  const addTask = async (goalId: string) => {
    if (!taskInput[goalId]?.trim()) return;

    try {
      await axios.post(
        "http://localhost:8000/add-task",
        {
          goal_id: goalId,
          title: taskInput[goalId],
          priority: "medium",
          due_date: null,
          estimated_minutes: null,
        }
      );

      setTaskInput({
        ...taskInput,
        [goalId]: "",
      });

      fetchGoals(user.email);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  // --------------------------------------------------
  // START TASK
  // --------------------------------------------------

  const startTask = async (task: Task) => {
  try {
    const response = await fetch(
      "http://localhost:5000/start-task",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: task.task_id,
          title: task.title,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Failed to start task:",
        data
      );
      return;
    }

    setActiveTask(task);
    setTimer(0);

    if (user?.email) {
      await fetchGoals(user.email);
    }

    await fetchToday();
    await fetchAnalytics(user.email);

  } catch (error) {
    console.error(
      "Failed to start task:",
      error
    );
  }
};
  // const startTask = async (task: Task) => {
  //   try {
  //     await fetch(
  //       "http://localhost:5000/start-task",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(task),
  //       }
  //     );

  //     setActiveTask(task);
  //     setTimer(0);
  //   } catch (error) {
  //     console.error("Failed to start task:", error);
  //   }
  // };


  // --------------------------------------------------
  // COMPLETE TASK
  // --------------------------------------------------

  const completeTask = async () => {
    if (!activeTask) return;

    try {
      await fetch(
        "http://localhost:5000/complete-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...activeTask,
            actual_duration: timer,
          }),
        }
      );

      setActiveTask(null);
      setTimer(0);

      if (user) {
        fetchGoals(user.email);
        fetchAnalytics(user.email);
      }

      fetchToday();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  // --------------------------------------------------
  // SAVE REFLECTION
  // --------------------------------------------------

  const saveReflection = async () => {
    try {
      await fetch(
        "http://localhost:5000/save-reflection",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reflection,
          }),
        }
      );

      setReflection("");
      alert("Reflection saved.");
    } catch (error) {
      console.error("Failed to save reflection:", error);
    }
  };

  // --------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------

  const allTasks = useMemo(() => {
    return goals.flatMap((goal) => goal.tasks || []);
  }, [goals]);

  const completedTasks = allTasks.filter(
    (task) => task.status === "completed"
  );

  const pendingTasks = allTasks.filter(
    (task) => task.status !== "completed"
  );

  const completionPercentage =
    allTasks.length > 0
      ? Math.round(
          (completedTasks.length / allTasks.length) * 100
        )
      : 0;

  const totalCompletedToday =
    summary?.completed_tasks ??
    completedTasks.length;

  const totalRemaining =
    summary?.remaining_tasks ??
    pendingTasks.length;

  // --------------------------------------------------
  // FORMAT TIMER
  // --------------------------------------------------

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours
      .toString()
      .padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-black">

      <Navbar />

      <main className="max-w-[1500px] mx-auto px-6 py-8">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>
            <p className="text-sm text-gray-500 mb-1">
              Personal Operating System
            </p>

            <h1 className="text-4xl font-semibold tracking-tight">
              Good to see you,{" "}
              {user?.name || user?.email || "User"}
            </h1>

            <p className="text-gray-500 mt-2">
              Here's what is happening with your day.
            </p>
          </div>

          <button
            onClick={() => {
              const firstTask = pendingTasks[0];

              if (firstTask) {
                startTask(firstTask);
              }
            }}
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition"
          >
            + Start Next Task
          </button>

        </div>


        {/* -----------------------------------------
            TOP STAT CARDS
        ------------------------------------------ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          {/* TODAY */}

          <div className="bg-black text-white rounded-2xl p-6">

            <div className="flex justify-between items-start">

              <div>
                <p className="text-sm text-gray-400">
                  Today's Progress
                </p>

                <h2 className="text-4xl font-semibold mt-3">
                  {completionPercentage}%
                </h2>
              </div>

              <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center">
                →
              </div>

            </div>

            <div className="mt-5 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>

            <p className="text-xs text-gray-400 mt-3">
              {totalCompletedToday} completed today
            </p>

          </div>


          {/* REMAINING */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Tasks Remaining
            </p>

            <h2 className="text-4xl font-semibold mt-3">
              {totalRemaining}
            </h2>

            <p className="text-sm text-gray-500 mt-4">
              Tasks still need your attention
            </p>

          </div>


          {/* STREAK */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Current Streak
            </p>

            <h2 className="text-4xl font-semibold mt-3">
              {streak}
              <span className="text-lg font-normal text-gray-400 ml-2">
                days
              </span>
            </h2>

            <p className="text-sm text-gray-500 mt-4">
              Consistent productive days
            </p>

          </div>


          {/* SKIPPED */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Skipped Tasks
            </p>

            <h2 className="text-4xl font-semibold mt-3">
              {skippedTasks}
            </h2>

            <p className="text-sm text-gray-500 mt-4">
              Planned but not completed
            </p>

          </div>

        </div>


        {/* -----------------------------------------
            AI NEXT MOVE
        ------------------------------------------ */}

        <div className="bg-black text-white rounded-2xl p-7 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 mb-3">

                <span className="w-2 h-2 bg-white rounded-full" />

                <p className="text-sm text-gray-400">
                  APOS Recommendation
                </p>

              </div>

              <h2 className="text-2xl font-semibold">
                Your Next Move
              </h2>

              <p className="text-gray-300 mt-2 max-w-2xl">
                {pendingTasks.length > 0
                  ? `Start "${pendingTasks[0].title}" because it is one of your remaining tasks.`
                  : "You have completed your current tasks. Review your progress or plan your next goal."}
              </p>

            </div>

            {pendingTasks.length > 0 && (
              <button
                onClick={() => startTask(pendingTasks[0])}
                className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition"
              >
                Start Task →
              </button>
            )}

          </div>

        </div>


        {/* -----------------------------------------
            MAIN GRID
        ------------------------------------------ */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


          {/* ---------------------------------------
              TODAY'S TASKS
          ---------------------------------------- */}

          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-semibold">
                  Today's Tasks
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Work that needs your attention.
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {allTasks.length} total
              </span>

            </div>


            {allTasks.length === 0 ? (

              <div className="py-12 text-center">

                <p className="text-gray-500">
                  No tasks yet.
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Create a goal and add your first task.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {allTasks.map((task) => (

                  <div
                    key={task.task_id}
                    className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition"
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`w-3 h-3 rounded-full ${
                          task.status === "completed"
                            ? "bg-black"
                            : "border-2 border-gray-400"
                        }`}
                      />

                      <div>

                        <p
                          className={`font-medium ${
                            task.status === "completed"
                              ? "line-through text-gray-400"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {task.status === "completed"
                            ? "Completed"
                            : "Pending"}
                        </p>

                      </div>

                    </div>


                    {task.status !== "completed" && (
                      <button
                        onClick={() => startTask(task)}
                        className="border border-black px-4 py-2 rounded-full text-sm hover:bg-black hover:text-white transition"
                      >
                        Start
                      </button>
                    )}

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* ---------------------------------------
              ACTIVE TIMER
          ---------------------------------------- */}

          <div className="bg-black text-white rounded-2xl p-6">

            <p className="text-sm text-gray-400">
              Focus Session
            </p>

            <h2 className="text-xl font-semibold mt-2">
              {activeTask
                ? activeTask.title
                : "No active task"}
            </h2>

            <div className="text-4xl font-mono tracking-wider mt-10">
              {formatTime(timer)}
            </div>

            {activeTask ? (

              <button
                onClick={completeTask}
                className="w-full mt-8 bg-white text-black py-3 rounded-full font-medium"
              >
                Complete Task
              </button>

            ) : (

              <p className="text-sm text-gray-400 mt-8">
                Start a task to begin a focus session.
              </p>

            )}

          </div>


          {/* ---------------------------------------
              WEEKLY PROGRESS
          ---------------------------------------- */}

          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">

            <div className="flex justify-between items-start mb-8">

              <div>
                <h2 className="text-xl font-semibold">
                  Weekly Progress
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  How consistently you completed your work.
                </p>
              </div>

              <span className="text-sm text-gray-400">
                Last 7 days
              </span>

            </div>


            <div className="flex items-end justify-between gap-4 h-48">

              {weeklyData.map((item, index) => {

                const maxValue = Math.max(
                  ...weeklyData.map(
                    (x) => x.completed
                  ),
                  1
                );

                const height =
                  (item.completed / maxValue) * 100;

                return (
                  <div
                    key={`${item.day}-${index}`}
                    className="flex-1 h-full flex flex-col items-center justify-end gap-3"
                  >

                    <span className="text-xs text-gray-400">
                      {item.completed}
                    </span>

                    <div className="w-full max-w-[42px] h-36 bg-gray-100 rounded-full flex items-end overflow-hidden">

                      <div
                        className="w-full bg-black rounded-full transition-all"
                        style={{
                          height: `${Math.max(
                            height,
                            item.completed > 0 ? 8 : 0
                          )}%`,
                        }}
                      />

                    </div>

                    <span className="text-xs text-gray-500">
                      {item.day}
                    </span>

                  </div>
                );
              })}

            </div>

          </div>


          {/* ---------------------------------------
              AI INSIGHT
          ---------------------------------------- */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Behavioral Intelligence
            </p>

            <h2 className="text-xl font-semibold mt-2">
              AI Insight
            </h2>

            <div className="mt-6">

              <div className="border-l-2 border-black pl-4">

                <p className="text-gray-700 leading-relaxed">
                  Your behavioral insights will appear here
                  once APOS has enough activity data.
                </p>

              </div>

            </div>

            <button
              onClick={() => router.push("/chat")}
              className="mt-6 text-sm font-medium underline"
            >
              Ask APOS →
            </button>

          </div>


        </div>


        {/* -----------------------------------------
            GOALS
        ------------------------------------------ */}

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>

              <h2 className="text-xl font-semibold">
                Goals
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Organize your tasks around what you want to achieve.
              </p>

            </div>

            <div className="flex gap-2">

              <input
                placeholder="Add a new goal..."
                value={newGoal}
                onChange={(e) =>
                  setNewGoal(e.target.value)
                }
                className="border border-gray-200 px-4 py-2 rounded-full outline-none focus:border-black"
              />

              <button
                onClick={addGoal}
                className="bg-black text-white px-5 py-2 rounded-full"
              >
                Add
              </button>

            </div>

          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {goals.map((goal) => (

              <div
                key={goal.goal_id}
                className="border border-gray-200 rounded-xl p-5"
              >

                <h3 className="font-semibold text-lg">
                  {goal.title}
                </h3>

                <div className="mt-4 space-y-2">

                  {goal.tasks.map((task) => (

                    <div
                      key={task.task_id}
                      className="flex items-center justify-between"
                    >

                      <span
                        className={
                          task.status === "completed"
                            ? "line-through text-gray-400"
                            : ""
                        }
                      >
                        {task.title}
                      </span>

                      {task.status !== "completed" && (
                        <button
                          onClick={() => startTask(task)}
                          className="text-sm underline"
                        >
                          Start
                        </button>
                      )}

                    </div>

                  ))}

                </div>


                {/* ADD TASK */}

                <div className="flex gap-2 mt-5">

                  <input
                    placeholder="New task..."
                    value={
                      taskInput[goal.goal_id] || ""
                    }
                    onChange={(e) =>
                      setTaskInput({
                        ...taskInput,
                        [goal.goal_id]:
                          e.target.value,
                      })
                    }
                    className="flex-1 border border-gray-200 px-3 py-2 rounded-lg outline-none"
                  />

                  <button
                    onClick={() =>
                      addTask(goal.goal_id)
                    }
                    className="bg-black text-white px-4 rounded-lg"
                  >
                    Add
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* -----------------------------------------
            REFLECTION
        ------------------------------------------ */}

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">

          <div className="mb-4">

            <h2 className="text-xl font-semibold">
              Daily Reflection
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Tell APOS what happened today.
            </p>

          </div>

          <textarea
            value={reflection}
            onChange={(e) =>
              setReflection(e.target.value)
            }
            placeholder="What went well? What did you struggle with?..."
            className="w-full min-h-[120px] border border-gray-200 rounded-xl p-4 outline-none focus:border-black resize-none"
          />

          <button
            onClick={saveReflection}
            className="mt-3 bg-black text-white px-5 py-2 rounded-full"
          >
            Save Reflection
          </button>

        </div>

      </main>

    </div>
  );
}