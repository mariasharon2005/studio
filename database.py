import datetime

class DatabaseManager:
    def __init__(self):
        self.users = []
        self.ghost_history = []
        self.alert_config = {
            "telegram_token": "",
            "chat_id": "",
            "enabled": False
        }
        # Mocking data for the new pro features
        self.shadow_resources = [
            {"id": "snap-9821x", "type": "Snapshot", "reason": "Unaccessed for 180 days", "monthly_saving": 14.50, "status": "detected"},
            {"id": "eip-0211a", "type": "Unattached EIP", "reason": "No instance association", "monthly_saving": 3.60, "status": "detected"},
            {"id": "vol-5522b", "type": "Detached EBS", "reason": "Detached for 14 days", "monthly_saving": 42.00, "status": "detected"}
        ]
        self.unit_economics = [
            {"date": "Mon", "total_cost": 400, "cost_per_user": 0.45, "is_healthy": True},
            {"date": "Tue", "total_cost": 410, "cost_per_user": 0.42, "is_healthy": True},
            {"date": "Wed", "total_cost": 450, "cost_per_user": 0.39, "is_healthy": True},
            {"date": "Thu", "total_cost": 500, "cost_per_user": 0.48, "is_healthy": False},
            {"date": "Fri", "total_cost": 480, "cost_per_user": 0.41, "is_healthy": True},
        ]
        self.gpu_nodes = [
            {"node_id": "gpu-h100-primary", "type": "NVIDIA H100", "utilization": 4.2, "hourly_cost": 3.45, "recommendation": "Transition to Spot G2"},
            {"node_id": "gpu-a100-worker-1", "type": "NVIDIA A100", "utilization": 88.0, "hourly_cost": 2.10, "recommendation": "Optimal Load"}
        ]

    async def get_shadow_scan(self):
        return self.shadow_resources

    async def get_unit_economics(self):
        return self.unit_economics

    async def get_gpu_sentinel(self):
        return self.gpu_nodes

    async def get_green_ops(self):
        return {
            "current_region": "US-East-1 (N. Virginia)",
            "target_region": "CA-Central-1 (Montreal)",
            "cost_saving_pct": 12.0,
            "carbon_reduction_pct": 40.0,
            "is_active": True
        }

    async def update_alert_config(self, config: dict):
        self.alert_config.update(config)
        return {"status": "updated", "config": self.alert_config}

    async def get_alert_config(self):
        return self.alert_config

db = DatabaseManager()
