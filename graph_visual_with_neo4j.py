import os
import json
from lightrag.utils import xml_to_json
from neo4j import GraphDatabase

# Constants
WORKING_DIR = './dickens'
BACTH_SIZE_NODES = 500
BATZH_SIZES_EDGES = 100

# Noe4j connection credentials
NEO4J_URI = 'neo4j://localhost:7687'
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "tchang323"

def convert_xml_to_json(xml_path, output_path):
    if not os.path.exists(xml_path):
        print(f"Error: file not found - {xml_path}")
        return None

    json_data = xml_to_json(xml_path)
    if json_data:
        with open(output_path, 'w', encoding="utf-8") as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        print(f"JSON file created: {output_path}")
        return json_data
    else:
        print("Failed to create JSON data")
        return None

def process_in_batches(tx, query, data, batch_size):
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        tx.run(query, {"nodes":batch} if "nodes" in query else {"edges":batch})

def main():
    # path
    xml_file = os.path.join(WORKING_DIR, 'graph_chunk_entity_relation.graphml')
    json_file = os.path.join(WORKING_DIR, 'graph_data.json')

    # Convert XML to JSON
    json_data = convert_xml_to_json(xml_file, json_file)
    if json_data is None:
        return
    
    # Load nodes and edges 
    nodes = json_data.get('nodes', [])
    edges = json_data.get('edges', [])

    # Neo4j queries
    create_nodes_query="""
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

    # Create a Noe4j driver
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

    try:
        # Execute queries in batches
        with driver.session() as session:
            # Insert nodes in batches
            session.execute_write(process_in_batches, create_nodes_query, nodes, BACTH_SIZE_NODES)
            # Insert edges in batches
            session.execute_write(process_in_batches, create_edges_query, edges, BATZH_SIZES_EDGES)

            # Set displayName and labels
            session.run(set_display_and_labels_query)

    except Exception as e:
        print(f"Error occured: {e}")
    
    finally:
        driver.close()

if __name__ == "__main__":
    main()