from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
from utils import load_data, save_data

app = Flask(__name__)
CORS(app)

# 📁 File path (per-user later you will replace this)
USER_FILE = "vault/user_123.json"


# 🗓️ Get today's date
def get_today():
    return datetime.now().strftime("%Y-%m-%d")


# 📦 Ensure today's structure exists
def ensure_today(data, today):
    if today not in data:
        data[today] = {
            "tasks": [],
            "summary": {
                "completion_rate": 0,
                "total_time": 0
            },
            "reflection": ""
        }


# 📡 GET TODAY DATA
@app.route("/get-today", methods=["GET"])
def get_today_data():
    try:
        data = load_data(USER_FILE)
        today = get_today()

        if today not in data:
            return jsonify({
                "tasks": [],
                "summary": {
                    "completion_rate": 0,
                    "total_time": 0
                },
                "reflection": ""
            })

        return jsonify(data[today])

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ▶️ START TASK
@app.route("/start-task", methods=["POST"])
def start_task():
    try:
        task = request.json
        data = load_data(USER_FILE)
        today = get_today()

        ensure_today(data, today)

        # ❗ Prevent duplicate active task
        for t in data[today]["tasks"]:
            if t["task_id"] == task["task_id"] and t["status"] == "in-progress":
                return jsonify({"msg": "Task already running"}), 400

        new_task = {
            "task_id": task["task_id"],
            "title": task["title"],
            "status": "in-progress",
            "start_time": datetime.now().isoformat(),
            "end_time": None,
            "actual_duration": 0
        }

        data[today]["tasks"].append(new_task)
        save_data(USER_FILE, data)

        return jsonify({"msg": "Task started successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ⏹️ COMPLETE TASK
@app.route("/complete-task", methods=["POST"])
def complete_task():
    try:
        task = request.json
        data = load_data(USER_FILE)
        today = get_today()

        ensure_today(data, today)

        found = False

        for t in data[today]["tasks"]:
            if t["task_id"] == task["task_id"] and t["status"] == "in-progress":
                t["end_time"] = datetime.now().isoformat()
                t["actual_duration"] = task.get("actual_duration", 0)
                t["status"] = "completed"
                found = True
                break

        if not found:
            return jsonify({"msg": "Task not found or already completed"}), 404

        # 🔄 Recalculate summary
        tasks = data[today]["tasks"]
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t["status"] == "completed"])
        total_time = sum(t.get("actual_duration", 0) for t in tasks)

        completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks else 0

        data[today]["summary"] = {
            "completion_rate": round(completion_rate, 2),
            "total_time": total_time
        }

        save_data(USER_FILE, data)

        return jsonify({
            "msg": "Task completed",
            "summary": data[today]["summary"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 💾 SAVE REFLECTION
@app.route("/save-reflection", methods=["POST"])
def save_reflection():
    try:
        reflection = request.json.get("reflection", "")

        data = load_data(USER_FILE)
        today = get_today()

        ensure_today(data, today)

        data[today]["reflection"] = reflection
        save_data(USER_FILE, data)

        return jsonify({"msg": "Reflection saved"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔥 HEALTH CHECK (optional but useful)
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "APOS backend running"})


# 🚀 RUN SERVER
if __name__ == "__main__":
    # Ensure vault folder exists
    if not os.path.exists("vault"):
        os.makedirs("vault")

    # Ensure file exists
    if not os.path.exists(USER_FILE):
        save_data(USER_FILE, {})

    app.run(debug=True)