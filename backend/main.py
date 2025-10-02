import json
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Telegram Todo API")

# Разрешаем все origins для простоты
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Модели данных (остаются без изменений)
class TaskBase(BaseModel):
    text: str
    completed: bool = False


class TaskCreate(TaskBase):
    pass


class Task(TaskBase):
    id: int


# Хранение данных (остается без изменений)
DATA_FILE = Path("tasks.json")


def load_tasks() -> List[Task]:
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [Task(**task) for task in data]
    return []


def save_tasks(tasks: List[Task]):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump([task.dict() for task in tasks], f, ensure_ascii=False, indent=2)


def get_next_id(tasks: List[Task]) -> int:
    return max([task.id for task in tasks], default=0) + 1


# API endpoints (остаются без изменений)
@app.get("/tasks", response_model=List[Task])
async def get_tasks():
    return load_tasks()


@app.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate):
    tasks = load_tasks()
    new_task = Task(
        id=get_next_id(tasks),
        text=task_data.text,
        completed=task_data.completed
    )
    tasks.append(new_task)
    save_tasks(tasks)
    return new_task


@app.put("/tasks/{task_id}/toggle", response_model=Task)
async def toggle_task(task_id: int):
    tasks = load_tasks()
    for task in tasks:
        if task.id == task_id:
            task.completed = not task.completed
            save_tasks(tasks)
            return task
    raise HTTPException(status_code=404, detail="Задача не найдена")


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    tasks = load_tasks()
    updated_tasks = [task for task in tasks if task.id != task_id]
    if len(updated_tasks) == len(tasks):
        raise HTTPException(status_code=404, detail="Задача не найдена")
    save_tasks(updated_tasks)
    return {"message": "Задача удалена"}


# Обслуживаем статику из папки 'static'
app.mount("/", StaticFiles(directory="static", html=True), name="static")
