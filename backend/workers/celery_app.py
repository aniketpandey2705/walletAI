from celery import Celery
from config import settings
import os

# Create Celery instance
celery_app = Celery(
    "walletdna",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["workers.process_statement"]
)

# Optional config
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
)

if __name__ == "__main__":
    celery_app.start()
