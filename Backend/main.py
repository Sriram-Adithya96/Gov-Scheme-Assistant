from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Government Scheme Assistant API is running"
    }