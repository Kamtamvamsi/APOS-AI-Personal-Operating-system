import json, os
from datetime import datetime

def load_data(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r") as f:
        return json.load(f)

def save_data(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def get_today():
    return datetime.now().strftime("%Y-%m-%d")