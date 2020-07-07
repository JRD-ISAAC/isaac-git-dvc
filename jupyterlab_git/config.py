import os

class Config:
    """
    Constants from environment to be used in the app
    """
    def __init__(self):
        """
        Initialize the constants here. If constant has a default value use get("keyname", "default_value")
        syntax or if it is required use square brackets [] syntax.
        """
        env = os.environ.copy()
        self.AWS_BUCKET_NAME = env.get("AWS_BUCKET_NAME", "seldon-sklearn")
        self.SELDON_API_URL = env.get("SELDON_API_URL", "http://localhost:8000/models/")
        self.AWS_ACCESS_KEY_ID = env["AWS_ACCESS_KEY_ID"]
        self.AWS_SECRET_ACCESS_KEY = env["AWS_SECRET_ACCESS_KEY"]