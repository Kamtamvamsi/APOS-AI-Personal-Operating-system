from fastapi import APIRouter
import json
import os

router = APIRouter()

DATA_FILE = "data/users.json"

# ensure file exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


def load_users():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_users(users):
    with open(DATA_FILE, "w") as f:
        json.dump(users, f, indent=4)


@router.post("/signup")
def signup(data: dict):
    users = load_users()

    users.append({
        "email": data["email"],
        "password": data["password"]
    })

    save_users(users)
    return {"message": "User created"}


@router.post("/login")
def login(data: dict):
    users = load_users()

    for user in users:
        if user["email"] == data["email"] and user["password"] == data["password"]:
            return {"success": True, "user": user}

    return {"success": False}