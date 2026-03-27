import datetime

class DatabaseManager:
    def __init__(self):
        # In production, use: self.client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
        self.users = []
        self.ghost_history = []

    async def save_user(self, user_data: dict):
        # Mock persistence
        user_data['created_at'] = datetime.datetime.utcnow().isoformat()
        self.users.append(user_data)
        return {"id": len(self.users), "status": "saved"}

    async def add_ghost_resource(self, resource_data: dict):
        resource_data['detected_at'] = datetime.datetime.utcnow().isoformat()
        self.ghost_history.append(resource_data)
        return {"status": "recorded"}

db = DatabaseManager()
