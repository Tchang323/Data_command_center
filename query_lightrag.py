import os
import logging
import asyncio
from lightrag import LightRAG, QueryParam
from lightrag.llm.ollama import ollama_model_complete, ollama_embedding
from lightrag.kg.shared_storage import initialize_pipeline_status
from lightrag.utils import EmbeddingFunc, setup_logger
import os

# 設定 Neo4j 連線資訊
os.environ["NEO4J_URI"] = "neo4j://localhost:7687"  # 根據你的 Neo4j 配置修改
os.environ["NEO4J_USERNAME"] = "neo4j"  # 你的 Neo4j 使用者名稱
os.environ["NEO4J_PASSWORD"] = "tchang323"  # 你的 Neo4j 密碼

# 設定日誌
setup_logger("lightrag", level="INFO")

# 設定工作目錄
WORKING_DIR = "./dickens"
os.makedirs(WORKING_DIR, exist_ok=True)

async def initialize_rag():
    """
    初始化 LightRAG 並返回 RAG 物件
    """
    try:
        rag = LightRAG(
            working_dir=WORKING_DIR,
            graph_storage="Neo4JStorage",
            llm_model_func=ollama_model_complete,
            llm_model_name="deepseek-r1:14b",
            llm_model_max_async=4,
            llm_model_max_token_size=10000,
            llm_model_kwargs={"host": "http://localhost:11434", "options": {"num_ctx": 10000}},
            embedding_func=EmbeddingFunc(
                embedding_dim=768,
                max_token_size=8192,
                func=lambda texts: ollama_embedding(
                    texts, embed_model="nomic-embed-text", host="http://localhost:11434"
                ),
            ),
        )

        await rag.initialize_storages()
        await initialize_pipeline_status()
        return rag
    except Exception as e:
        logging.error(f"Error initializing LightRAG: {e}")
        return None

async def process_query(rag):
    """
    接收使用者輸入並查詢 LightRAG，返回 LLM 生成的回應
    """
    try:
        query_text = input("請輸入你的查詢: ")  # 讓使用者輸入查詢內容
        if not query_text.strip():
            print("輸入不可為空，請重新輸入")
            return

        mode = "hybrid"  # 可以選擇 "naive", "local", "global", "hybrid"
        query_param = QueryParam(mode=mode)

        response = await rag.aquery(query_text, param=query_param)
        print(f"\n💡 LLM 回應: {response}\n")

    except Exception as e:
        logging.error(f"Error processing query: {e}")

async def main():
    """
    主函式，負責初始化 RAG 並處理查詢
    """
    rag = await initialize_rag()
    if rag:
        await process_query(rag)
    else:
        print("無法初始化 LightRAG，請檢查錯誤日誌")

if __name__ == "__main__":
    asyncio.run(main())
