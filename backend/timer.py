# timer.py

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 🔹 In-memory storage
active_task = None
completed_tasks = []
reflection_store = ""

# ▶️ START TASK
@app.route("/start-task", methods=["POST"])
def start_task():
    global active_task

    active_task = request.json

    return jsonify({"message": "Task started"})


# ⏹️ COMPLETE TASK
@app.route("/complete-task", methods=["POST"])
def complete_task():
    global active_task, completed_tasks

    data = request.json

    completed_tasks.append(data)
    active_task = None

    return jsonify({"message": "Task completed"})


# 📊 GET TODAY SUMMARY
@app.route("/get-today", methods=["GET"])
def get_today():
    total_tasks = len(completed_tasks)

    total_time = sum(
        task.get("actual_duration", 0) for task in completed_tasks
    )

    completion_rate = 0
    if total_tasks > 0:
        completion_rate = 100  # simple for now

    return jsonify({
        "tasks": completed_tasks,
        "summary": {
            "completion_rate": completion_rate,
            "total_time": total_time
        }
    })


# 💾 SAVE REFLECTION
@app.route("/save-reflection", methods=["POST"])
def save_reflection():
    global reflection_store

    data = request.json
    reflection_store = data.get("reflection", "")

    return jsonify({"message": "Reflection saved"})


if __name__ == "__main__":
    app.run(port=5000, debug=True)