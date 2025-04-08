# ollama_service.py
from ollama import Client  

class OllamaService:
    def __init__(
        self,
        address: str = "http://localhost:11434",
        model: str = "deepseek-r1:14b",
        system_prompt: str = "你是一個資深海軍戰情室指揮官，負責干擾及通訊領域，請一定用繁體中文回應"
    ):
        self._address = address
        self._model = model
        self._system_prompt = system_prompt  # 添加系統提示作為類屬性
    
    def get_chat_stream(self, query: str):
        client = Client(host=self._address)
        
        # 創建聊天消息，首先添加系統消息
        chat_messages = [
            {'role': 'system', 'content': self._system_prompt},  # 系統提示
            {'role': 'user', 'content': query}  # 用戶查詢
        ]
        
        stream = client.chat(model=self._model, messages=chat_messages, stream=True)
        
        for chunk in stream:
            yield chunk['message']['content']