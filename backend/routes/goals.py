# from fastapi import APIRouter
# import json
# import os
# import uuid

# router = APIRouter()

# DATA_FILE = "data/goals.json"

# if not os.path.exists(DATA_FILE):
#     with open(DATA_FILE, "w") as f:
#         json.dump([], f)


# def load_data():
#     with open(DATA_FILE, "r") as f:
#         return json.load(f)


# def save_data(data):
#     with open(DATA_FILE, "w") as f:
#         json.dump(data, f, indent=4)


# # ➕ Create Goal
# @router.post("/add-goal")
# def add_goal(data: dict):
#     db = load_data()

#     goal = {
#         "goal_id": str(uuid.uuid4()),
#         "user_email": data["user_email"],
#         "title": data["title"],
#         "tasks": []
#     }

#     db.append(goal)
#     save_data(db)

#     return {"message": "Goal added", "goal": goal}


# # ➕ Add Task
# @router.post("/add-task")
# def add_task(data: dict):
#     db = load_data()

#     for goal in db:
#         if goal["goal_id"] == data["goal_id"]:
#             task = {
#                 "task_id": str(uuid.uuid4()),
#                 "title": data["title"],
#                 "completed": False
#             }
#             goal["tasks"].append(task)
#             save_data(db)
#             return {"message": "Task added", "task": task}

#     return {"error": "Goal not found"}


# # 📥 Get Goals for User
# @router.post("/get-goals")
# def get_goals(data: dict):
#     db = load_data()

#     user_goals = [g for g in db if g["user_email"] == data["user_email"]]

#     return {"goals": user_goals}



from fastapi import APIRouter, HTTPException
import json
import os
import uuid
from datetime import datetime

router = APIRouter()

DATA_FILE = "data/goals.json"

os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)


def normalize_task(task):
    """
    Keep the task structure consistent everywhere in APOS.
    """

    task.setdefault("status", "pending")
    task.setdefault("priority", "medium")
    task.setdefault("due_date", None)
    task.setdefault("estimated_minutes", 30)
    task.setdefault(
        "created_at",
        datetime.now().isoformat()
    )

    task["completed"] = (
        task["status"] == "completed"
    )

    return task


# --------------------------------------------------
# ADD GOAL
# --------------------------------------------------

@router.post("/add-goal")
def add_goal(data: dict):

    user_email = (
        data.get("user_email") or ""
    ).strip()

    title = (
        data.get("title") or ""
    ).strip()

    if not user_email or not title:
        raise HTTPException(
            status_code=400,
            detail="user_email and title are required"
        )

    db = load_data()

    goal = {
        "goal_id": str(uuid.uuid4()),
        "user_email": user_email,
        "title": title,
        "tasks": []
    }

    db.append(goal)

    save_data(db)

    return {
        "message": "Goal added",
        "goal": goal
    }


# --------------------------------------------------
# ADD TASK
# --------------------------------------------------

@router.post("/add-task")
def add_task(data: dict):

    goal_id = data.get("goal_id")

    title = (
        data.get("title") or ""
    ).strip()

    if not goal_id or not title:
        raise HTTPException(
            status_code=400,
            detail="goal_id and title are required"
        )

    db = load_data()

    for goal in db:

        if goal["goal_id"] == goal_id:

            task = normalize_task({

                "task_id": str(uuid.uuid4()),

                "title": title,

                "status": data.get(
                    "status",
                    "pending"
                ),

                "priority": data.get(
                    "priority",
                    "medium"
                ),

                "due_date": (
                    data.get("due_date")
                    or None
                ),

                "estimated_minutes": int(
                    data.get(
                        "estimated_minutes",
                        30
                    )
                )

            })

            goal.setdefault(
                "tasks",
                []
            ).append(task)

            save_data(db)

            return {
                "message": "Task added",
                "task": task
            }

    raise HTTPException(
        status_code=404,
        detail="Goal not found"
    )


# --------------------------------------------------
# UPDATE TASK
# --------------------------------------------------

@router.post("/update-task")
def update_task(data: dict):

    task_id = data.get("task_id")

    if not task_id:
        raise HTTPException(
            status_code=400,
            detail="task_id is required"
        )

    db = load_data()

    for goal in db:

        for task in goal.get(
            "tasks",
            []
        ):

            if task["task_id"] == task_id:

                allowed_fields = [
                    "title",
                    "priority",
                    "due_date",
                    "estimated_minutes",
                    "status"
                ]

                for field in allowed_fields:

                    if (
                        field in data
                        and data[field] is not None
                    ):
                        task[field] = data[field]

                normalize_task(task)

                save_data(db)

                return {
                    "message": "Task updated",
                    "task": task
                }

    raise HTTPException(
        status_code=404,
        detail="Task not found"
    )


# --------------------------------------------------
# GET USER GOALS
# --------------------------------------------------

@router.post("/get-goals")
def get_goals(data: dict):

    user_email = data.get(
        "user_email"
    )

    db = load_data()

    user_goals = [
        g
        for g in db
        if g.get("user_email") == user_email
    ]

    for goal in user_goals:

        goal["tasks"] = [
            normalize_task(task)
            for task in goal.get(
                "tasks",
                []
            )
        ]

    save_data(db)

    return {
        "goals": user_goals
    }


# --------------------------------------------------
# SEED STARTER TASKS
# --------------------------------------------------

@router.post("/seed-starter-tasks")
def seed_starter_tasks(data: dict):

    user_email = (
        data.get("user_email") or ""
    ).strip()

    if not user_email:
        raise HTTPException(
            status_code=400,
            detail="user_email is required"
        )

    db = load_data()

    existing = [
        g
        for g in db
        if g.get("user_email") == user_email
    ]

    # Don't duplicate starter tasks
    if any(
        g.get("tasks")
        for g in existing
    ):

        return {
            "message": "Starter tasks already exist",
            "created": False,
            "goals": existing
        }

    goal = {
        "goal_id": str(uuid.uuid4()),
        "user_email": user_email,
        "title": "AI Engineer Growth",
        "tasks": []
    }

    starter_tasks = [

        (
            "Practice DSA for 45 minutes",
            "high",
            45
        ),

        (
            "Build one ML project feature",
            "high",
            60
        ),

        (
            "Read one AI research paper",
            "medium",
            30
        ),

        (
            "Apply to 2 AI/ML roles",
            "medium",
            30
        ),

        (
            "Review yesterday's progress",
            "low",
            15
        )

    ]

    for title, priority, minutes in starter_tasks:

        task = normalize_task({

            "task_id": str(uuid.uuid4()),

            "title": title,

            "status": "pending",

            "priority": priority,

            "due_date": None,

            "estimated_minutes": minutes

        })

        goal["tasks"].append(task)

    db.append(goal)

    save_data(db)

    return {
        "message": "Starter tasks created",
        "created": True,
        "goal": goal
    }