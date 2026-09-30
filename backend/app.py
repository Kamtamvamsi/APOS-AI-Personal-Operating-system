# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# from datetime import datetime
# from utils import load_data, save_data

# app = Flask(__name__)
# CORS(app)

# # 📁 File path (per-user later you will replace this)
# USER_FILE = "vault/user_123.json"


# # 🗓️ Get today's date
# def get_today():
#     return datetime.now().strftime("%Y-%m-%d")


# # 📦 Ensure today's structure exists
# def ensure_today(data, today):
#     if today not in data:
#         data[today] = {
#             "tasks": [],
#             "summary": {
#                 "completion_rate": 0,
#                 "total_time": 0
#             },
#             "reflection": ""
#         }


# # 📡 GET TODAY DATA
# @app.route("/get-today", methods=["GET"])
# def get_today_data():
#     try:
#         data = load_data(USER_FILE)
#         today = get_today()

#         if today not in data:
#             return jsonify({
#                 "tasks": [],
#                 "summary": {
#                     "completion_rate": 0,
#                     "total_time": 0
#                 },
#                 "reflection": ""
#             })

#         return jsonify(data[today])

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # ▶️ START TASK
# @app.route("/start-task", methods=["POST"])
# def start_task():
#     try:
#         task = request.json
#         data = load_data(USER_FILE)
#         today = get_today()

#         ensure_today(data, today)

#         # ❗ Prevent duplicate active task
#         for t in data[today]["tasks"]:
#             if t["task_id"] == task["task_id"] and t["status"] == "in-progress":
#                 return jsonify({"msg": "Task already running"}), 400

#         new_task = {
#             "task_id": task["task_id"],
#             "title": task["title"],
#             "status": "in-progress",
#             "start_time": datetime.now().isoformat(),
#             "end_time": None,
#             "actual_duration": 0
#         }

#         data[today]["tasks"].append(new_task)
#         save_data(USER_FILE, data)

#         return jsonify({"msg": "Task started successfully"})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # ⏹️ COMPLETE TASK
# @app.route("/complete-task", methods=["POST"])
# def complete_task():
#     try:
#         task = request.json
#         data = load_data(USER_FILE)
#         today = get_today()

#         ensure_today(data, today)

#         found = False

#         for t in data[today]["tasks"]:
#             if t["task_id"] == task["task_id"] and t["status"] == "in-progress":
#                 t["end_time"] = datetime.now().isoformat()
#                 t["actual_duration"] = task.get("actual_duration", 0)
#                 t["status"] = "completed"
#                 found = True
#                 break

#         if not found:
#             return jsonify({"msg": "Task not found or already completed"}), 404

#         # 🔄 Recalculate summary
#         tasks = data[today]["tasks"]
#         total_tasks = len(tasks)
#         completed_tasks = len([t for t in tasks if t["status"] == "completed"])
#         total_time = sum(t.get("actual_duration", 0) for t in tasks)

#         completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks else 0

#         data[today]["summary"] = {
#             "completion_rate": round(completion_rate, 2),
#             "total_time": total_time
#         }

#         save_data(USER_FILE, data)

#         return jsonify({
#             "msg": "Task completed",
#             "summary": data[today]["summary"]
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # 💾 SAVE REFLECTION
# @app.route("/save-reflection", methods=["POST"])
# def save_reflection():
#     try:
#         reflection = request.json.get("reflection", "")

#         data = load_data(USER_FILE)
#         today = get_today()

#         ensure_today(data, today)

#         data[today]["reflection"] = reflection
#         save_data(USER_FILE, data)

#         return jsonify({"msg": "Reflection saved"})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # 🔥 HEALTH CHECK (optional but useful)
# @app.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "APOS backend running"})


# # 🚀 RUN SERVER
# if __name__ == "__main__":
#     # Ensure vault folder exists
#     if not os.path.exists("vault"):
#         os.makedirs("vault")

#     # Ensure file exists
#     if not os.path.exists(USER_FILE):
#         save_data(USER_FILE, {})

#     app.run(debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime

from utils import load_data, save_data


app = Flask(__name__)
CORS(app)


# ============================================================
# FILE PATHS
# ============================================================

USER_FILE = "vault/user_123.json"
GOALS_FILE = "data/goals.json"


# ============================================================
# BASIC HELPERS
# ============================================================

def get_today():
    return datetime.now().strftime("%Y-%m-%d")


def ensure_today(data, today):
    """
    Make sure today's APOS activity structure exists.
    """

    if today not in data:
        data[today] = {
            "tasks": [],
            "summary": {
                "completion_rate": 0,
                "total_time": 0,
                "completed_tasks": 0,
                "remaining_tasks": 0,
            },
            "reflection": "",
        }


# ============================================================
# GOALS DATABASE HELPERS
# ============================================================

def load_goals():
    """
    Load goals from data/goals.json.
    """

    if not os.path.exists(GOALS_FILE):
        return []

    try:
        with open(GOALS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)

    except (json.JSONDecodeError, OSError):
        return []


def save_goals(goals):
    """
    Save goals back to data/goals.json.
    """

    directory = os.path.dirname(GOALS_FILE)

    if directory:
        os.makedirs(directory, exist_ok=True)

    with open(GOALS_FILE, "w", encoding="utf-8") as file:
        json.dump(goals, file, indent=4)


def sync_goal_task_status(task_id, status):
    """
    Keep goals.json synchronized with the activity/timer database.

    Example:

        Dashboard
             ↓
        /start-task
             ↓
        status = in-progress
             ↓
        goals.json

    and

        Dashboard
             ↓
        /complete-task
             ↓
        status = completed
             ↓
        goals.json
    """

    goals = load_goals()

    changed = False

    for goal in goals:

        for task in goal.get("tasks", []):

            if task.get("task_id") == task_id:

                task["status"] = status
                task["completed"] = status == "completed"

                changed = True

                break

        if changed:
            break

    if changed:
        save_goals(goals)

    return changed


# ============================================================
# RECALCULATE TODAY SUMMARY
# ============================================================

def calculate_today_summary(tasks):
    """
    Calculate completion statistics for today's tasks.
    """

    total_tasks = len(tasks)

    completed_tasks = len(
        [
            task
            for task in tasks
            if task.get("status") == "completed"
        ]
    )

    remaining_tasks = total_tasks - completed_tasks

    total_time = sum(
        task.get("actual_duration", 0) or 0
        for task in tasks
    )

    completion_rate = (
        (completed_tasks / total_tasks) * 100
        if total_tasks
        else 0
    )

    return {
        "completion_rate": round(completion_rate, 2),
        "total_time": total_time,
        "completed_tasks": completed_tasks,
        "remaining_tasks": remaining_tasks,
    }


# ============================================================
# GET TODAY
# ============================================================

@app.route("/get-today", methods=["GET"])
def get_today_data():

    try:

        data = load_data(USER_FILE)

        today = get_today()

        ensure_today(data, today)

        tasks = data[today].get("tasks", [])

        summary = calculate_today_summary(tasks)

        data[today]["summary"] = summary

        save_data(USER_FILE, data)

        return jsonify(data[today])

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# ============================================================
# START TASK
# ============================================================

@app.route("/start-task", methods=["POST"])
def start_task():

    try:

        task = request.get_json(silent=True) or {}

        task_id = task.get("task_id")

        title = task.get(
            "title",
            "Untitled Task"
        )

        if not task_id:

            return jsonify({
                "error": "task_id is required"
            }), 400

        data = load_data(USER_FILE)

        today = get_today()

        ensure_today(data, today)

        today_tasks = data[today]["tasks"]


        # ----------------------------------------------------
        # PREVENT DUPLICATE ACTIVE TASK
        # ----------------------------------------------------

        for existing_task in today_tasks:

            if (
                existing_task.get("task_id") == task_id
                and existing_task.get("status") == "in-progress"
            ):

                return jsonify({
                    "msg": "Task already running"
                }), 400


        # ----------------------------------------------------
        # PREVENT STARTING COMPLETED TASK
        # ----------------------------------------------------

        for existing_task in today_tasks:

            if (
                existing_task.get("task_id") == task_id
                and existing_task.get("status") == "completed"
            ):

                return jsonify({
                    "msg": "Task already completed"
                }), 400


        # ----------------------------------------------------
        # CREATE ACTIVITY RECORD
        # ----------------------------------------------------

        new_task = {
            "task_id": task_id,
            "title": title,
            "status": "in-progress",
            "start_time": datetime.now().isoformat(),
            "end_time": None,
            "actual_duration": 0,
        }

        today_tasks.append(new_task)

        data[today]["summary"] = calculate_today_summary(
            today_tasks
        )

        save_data(USER_FILE, data)


        # ----------------------------------------------------
        # SYNC WITH GOALS
        # ----------------------------------------------------

        sync_goal_task_status(
            task_id,
            "in-progress"
        )


        return jsonify({
            "msg": "Task started successfully",
            "task": new_task,
        })


    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# ============================================================
# COMPLETE TASK
# ============================================================

@app.route("/complete-task", methods=["POST"])
def complete_task():

    try:

        task = request.get_json(silent=True) or {}

        task_id = task.get("task_id")

        if not task_id:

            return jsonify({
                "error": "task_id is required"
            }), 400


        data = load_data(USER_FILE)

        today = get_today()

        ensure_today(data, today)

        today_tasks = data[today]["tasks"]

        found = False


        # ----------------------------------------------------
        # FIND ACTIVE TASK
        # ----------------------------------------------------

        for existing_task in today_tasks:

            if (
                existing_task.get("task_id") == task_id
                and existing_task.get("status") == "in-progress"
            ):

                existing_task["end_time"] = (
                    datetime.now().isoformat()
                )

                existing_task["actual_duration"] = (
                    task.get("actual_duration", 0) or 0
                )

                existing_task["status"] = "completed"

                found = True

                break


        if not found:

            return jsonify({
                "msg": "Task not found or already completed"
            }), 404


        # ----------------------------------------------------
        # RECALCULATE SUMMARY
        # ----------------------------------------------------

        summary = calculate_today_summary(
            today_tasks
        )

        data[today]["summary"] = summary

        save_data(USER_FILE, data)


        # ----------------------------------------------------
        # SYNC WITH GOALS
        # ----------------------------------------------------

        sync_goal_task_status(
            task_id,
            "completed"
        )


        return jsonify({
            "msg": "Task completed",
            "summary": summary,
        })


    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# ============================================================
# SAVE REFLECTION
# ============================================================

@app.route("/save-reflection", methods=["POST"])
def save_reflection():

    try:

        payload = request.get_json(
            silent=True
        ) or {}

        reflection = payload.get(
            "reflection",
            ""
        )

        data = load_data(USER_FILE)

        today = get_today()

        ensure_today(data, today)

        data[today]["reflection"] = reflection

        save_data(USER_FILE, data)

        return jsonify({
            "msg": "Reflection saved"
        })


    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# ============================================================
# DASHBOARD ANALYTICS
# ============================================================

@app.route("/dashboard-analytics", methods=["GET"])
def dashboard_analytics():

    try:

        data = load_data(USER_FILE)

        today = datetime.now().date()

        completed_by_date = {}


        # ----------------------------------------------------
        # COLLECT COMPLETED TASKS BY DATE
        # ----------------------------------------------------

        for date_key, day_data in data.items():

            try:

                parsed_date = datetime.strptime(
                    date_key,
                    "%Y-%m-%d"
                ).date()

            except (
                ValueError,
                TypeError
            ):

                continue


            completed_count = len(
                [
                    task
                    for task in day_data.get("tasks", [])
                    if task.get("status") == "completed"
                ]
            )

            completed_by_date[
                parsed_date
            ] = completed_count


        # ----------------------------------------------------
        # LAST 7 DAYS
        # ----------------------------------------------------

        weekly_activity = []

        for offset in range(6, -1, -1):

            day_date = (
                today.fromordinal(
                    today.toordinal() - offset
                )
            )

            weekly_activity.append({
                "day": day_date.strftime("%a")[0],
                "completed": completed_by_date.get(
                    day_date,
                    0
                ),
            })


        # ----------------------------------------------------
        # CURRENT STREAK
        # ----------------------------------------------------

        streak = 0

        cursor = today

        while completed_by_date.get(
            cursor,
            0
        ) > 0:

            streak += 1

            cursor = (
                cursor.fromordinal(
                    cursor.toordinal() - 1
                )
            )


        # ----------------------------------------------------
        # SKIPPED TASKS
        # ----------------------------------------------------

        # APOS does not currently store an explicit
        # "skipped" status.
        skipped_tasks = 0


        return jsonify({
            "streak": streak,
            "skipped_tasks": skipped_tasks,
            "weekly_activity": weekly_activity,
        })


    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "APOS backend running"
    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    os.makedirs(
        "vault",
        exist_ok=True
    )

    os.makedirs(
        "data",
        exist_ok=True
    )


    # Create user file if it doesn't exist.

    if not os.path.exists(USER_FILE):

        save_data(
            USER_FILE,
            {}
        )


    # Create goals file if it doesn't exist.

    if not os.path.exists(GOALS_FILE):

        save_goals([])


    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )