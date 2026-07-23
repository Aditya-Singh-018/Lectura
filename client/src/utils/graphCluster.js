export function groupIntoConnectedComponents(concepts = [],edges = []){
    if(!concepts || concepts.length === 0) return [];

    //Adjacency List
    const adj = {};
    concepts.forEach((c)=>{
        adj[c.id] = [];
    });

    edges.forEach((edge) => {
        const src = edge.source_concept_id;
        const target = edge.target_concept_id;

        if(adj[src] && adj[target]){
        adj[src].push(target);
        adj[target].push(src); 
        }
    });

    const visited = new Set();
    const clusters = [];

    concepts.forEach((concepts)=>{
        if(!visited.has(concept.id)){   //Multi source BFS for connected components
            const clusterConceptIds = new Set();
            const queue = [concept.id];

            visited.add(concept.id);
            clusterConceptIds.add(concept.id);

            while(queue.length > 0){        //visiting all the concepts of this particular cluster
                const currId = queue.shift();
                (adj[currId] || []).forEach((neighborId) => {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    clusterConceptIds.add(neighborId);
                    queue.push(neighborId);
                }
                });
            }

            //Filtering concepts of current cluster only
            const clusterConcepts = concepts.filter((c) => clusterConceptIds.has(c.id));
            //Keep only edges where BOTH endpoints are inside this connected component
            const clusterEdges = edges.filter(
                (e) =>
                clusterConceptIds.has(e.source_concept_id) &&
                clusterConceptIds.has(e.target_concept_id)
            );

            clusters.push({
                id: `cluster-${clusters.length + 1}`,
                concepts: clusterConcepts,
                edges: clusterEdges,
            });
        }
    });
    return clusters;
}