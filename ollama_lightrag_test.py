import os
import logging
import asyncio
from lightrag import LightRAG, QueryParam
from lightrag.llm.ollama import ollama_model_complete, ollama_embedding
from lightrag.kg.shared_storage import initialize_pipeline_status
from lightrag.utils import EmbeddingFunc, setup_logger

setup_logger("lightrag", level="INFO")

WORKING_DIR = "./dickens"

if not os.path.exists(WORKING_DIR):
    os.makedirs(WORKING_DIR)

async def initialize_rag():
    rag = LightRAG(
        working_dir=WORKING_DIR,
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

async def main():
    rag = await initialize_rag()

    # Insert text asynchronously
    with open("./book.txt", "r", encoding="utf-8") as f:
        text = f.read()
    await rag.ainsert(text)

    # Perform different query modes asynchronously
    modes = ["naive", "local", "global", "hybrid"]
    
    for mode in modes:
        response = await rag.aquery("What are the top themes in this story?", param=QueryParam(mode=mode))
        print(f"Mode: {mode} -> {response}")

if __name__ == "__main__":
    asyncio.run(main())
