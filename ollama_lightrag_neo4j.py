import os
import logging
import asyncio
import json
from neo4j import GraphDatabase
from lightrag import LightRAG, QueryParam
from lightrag.llm.ollama import ollama_model_complete, ollama_embedding
from lightrag.kg.shared_storage import initialize_pipeline_status
from lightrag.utils import EmbeddingFunc, setup_logger, xml_to_json

# Setup logger and constants
setup_logger("lightrag", level="INFO")
WORKING_DIR = "./dickens"
NEO4J_URI = 'neo4j://localhost:7687'
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "tchang323"
BATCH_SIZE_NODES = 500
BATCH_SIZE_EDGES = 100  # Fixed typo from original code

if not os.path.exists(WORKING_DIR):
    os.makedirs(WORKING_DIR)

async def initialize_rag():
    """Initialize the LightRAG instance with Neo4J storage"""
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

def process_in_batches(tx, query, data, batch_size):
    """Process Neo4j operations in batches"""
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        tx.run(query, {"nodes": batch} if "nodes" in query else {"edges": batch})

def load_to_neo4j(xml_path):
    """Load the LightRAG output into Neo4j"""
    # Convert XML to JSON
    if not os.path.exists(xml_path):
        print(f"Error: file not found - {xml_path}")
        return None

    json_data = xml_to_json(xml_path)
    if not json_data:
        print("Failed to create JSON data")
        return None
    
    # Save JSON file for reference
    json_file = os.path.join(WORKING_DIR, 'graph_data.json')
    with open(json_file, 'w', encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    print(f"JSON file created: {json_file}")
    
    # Load nodes and edges 
    nodes = json_data.get('nodes', [])
    edges = json_data.get('edges', [])

    # Neo4j queries
    create_nodes_query = """
    UNWIND $nodes AS node
    MERGE (e:Entity {id: node.id})
    SET e.entity_type = node.entity_type,
        e.description = node.description,
        e.source_id = node.source_id,
        e.displayName = node.id
    REMOVE e:Entity
    WITH e, node
    CALL apoc.create.addLabels(e, [node.entity_type]) YIELD node AS labelNode
    RETURN count(*)
    """

    create_edges_query = """
    UNWIND $edges AS edge
    MATCH (source {id: edge.source})
    MATCH (target {id: edge.target})
    WITH source, target, edge,
        CASE
            WHEN edge.keywords CONTAINS 'lead' THEN 'lead'
            WHEN edge.keywords CONTAINS 'participate' THEN 'participate'
            WHEN edge.keywords CONTAINS 'uses' THEN 'uses'
            WHEN edge.keywords CONTAINS 'located' THEN 'located'
            WHEN edge.keywords CONTAINS 'occurs' THEN 'occurs'
          ELSE REPLACE(SPLIT(edge.keywords, ',')[0], '\"', '')
        END AS relType
    CALL apoc.create.relationship(source, relType, {
        weight: edge.weight,
        description: edge.description,
        keywords: edge.keywords,
        source_id: edge.source_id
    }, target) YIELD rel
    RETURN count(*)
    """

    set_display_and_labels_query = """
    MATCH (n)
    SET n.displayName = n.id
    WITH n
    CALL apoc.create.setLabels(n, [n.entity_type]) YIELD node
    RETURN count(*)
    """

    # Create a Neo4j driver
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

    try:
        # Execute queries in batches
        with driver.session() as session:
            # Insert nodes in batches
            session.execute_write(process_in_batches, create_nodes_query, nodes, BATCH_SIZE_NODES)
            # Insert edges in batches
            session.execute_write(process_in_batches, create_edges_query, edges, BATCH_SIZE_EDGES)
            # Set displayName and labels
            session.run(set_display_and_labels_query)
            print(f"Successfully loaded {len(nodes)} nodes and {len(edges)} edges to Neo4j")

    except Exception as e:
        print(f"Error occurred: {e}")
    
    finally:
        driver.close()

async def main():
    # Initialize LightRAG
    rag = await initialize_rag()

    # Insert text asynchronously
    print("Loading text data into LightRAG...")
    with open("./book.txt", "r", encoding="utf-8") as f:
        text = f.read()
    await rag.ainsert(text)
    print("Text data has been processed by LightRAG")

    # Perform different query modes asynchronously
    modes = ["naive", "local", "global", "hybrid"]
    
    for mode in modes:
        response = await rag.aquery("What are the top themes in this story?", param=QueryParam(mode=mode))
        print(f"Mode: {mode} -> {response}")
    
    # After LightRAG has processed the data, load the output to Neo4j
    xml_path = os.path.join(WORKING_DIR, 'graph_chunk_entity_relation.graphml')
    print(f"Loading LightRAG output from {xml_path} to Neo4j...")
    load_to_neo4j(xml_path)
    print("Process completed!")

if __name__ == "__main__":
    asyncio.run(main())