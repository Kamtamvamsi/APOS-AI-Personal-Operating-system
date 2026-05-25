from fastapi import APIRouter
import json
import os
import uuid

router = APIRouter()

DATA_FILE = "data/goals.json"

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)


# ➕ Create Goal
@router.post("/add-goal")
def add_goal(data: dict):
    db = load_data()

    goal = {
        "goal_id": str(uuid.uuid4()),
        "user_email": data["user_email"],
        "title": data["title"],
        "tasks": []
    }

    db.append(goal)
    save_data(db)

    return {"message": "Goal added", "goal": goal}


# ➕ Add Task
@router.post("/add-task")
def add_task(data: dict):
    db = load_data()

    for goal in db:
        if goal["goal_id"] == data["goal_id"]:
            task = {
                "task_id": str(uuid.uuid4()),
                "title": data["title"],
                "completed": False
            }
            goal["tasks"].append(task)
            save_data(db)
            return {"message": "Task added", "task": task}

    return {"error": "Goal not found"}


# 📥 Get Goals for User
@router.post("/get-goals")
def get_goals(data: dict):
    db = load_data()

    user_goals = [g for g in db if g["user_email"] == data["user_email"]]

    return {"goals": user_goals}