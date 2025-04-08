# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.responses import StreamingResponse
from ollama_service import OllamaService

app = FastAPI()

# 允許跨域請求，讓前端可以連線
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可根據需求限制來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str

# 創建 OllamaService 實例，可以指定系統提示
ai_service = OllamaService()

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(ai_service.get_chat_stream(request.query), media_type="text/event-stream")