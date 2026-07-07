export class Graph{
    constructor(concepts,concept_edges){
        this.concepts = concepts;
        this.concept_edges = concept_edges;
        this.adjList = new Map();
        this.inDegree = new Map();  //enable O(1) lookup

        this.initializeGraph();
    }

    initializeGraph(){
        this.concepts.forEach(id => {
            this.adjList.set(id, []);
            this.inDegree.set(id, 0);
        });

        this.concept_edges.forEach(edge =>{
            const u = edge.source_id;
            const v = edge.target_id;

            if(this.adjList.has(u) && this.adjList.has(v)){
                this.adjList.get(u).push(v);
                this.inDegree.set(v,this.inDegree.get(v)+1);
            }
        });
    }

    topoSort(){
        const sortedOrder = [];

        const queue = [];
        const brokenEdges = [];

        for(const [id,degree] of this.inDegree.entries()){
            if(degree === 0) queue.push(id);
        }

        while(sortedOrder.length <this.concepts.length){

            if(queue.length == 0){
                console.log("Cycle detected, Initiating fallback break...");
                const unprocessedNodes = this.concepts.filter(id => !sortedOrder.includes(id));

                let targetNode = null;
                let mnInDegree = Infinity;

                for(const node in unprocessedNodes){
                    let deg = this.inDegree.get(node);
                    if(deg>0 && deg < mnIndegree){
                        mnInDegree = deg;
                        targetNode = node;
                    }
                }

                if(!targetNode){
                    throw new Error("Graph Parsing broke during cycle resolution!");
                }

                let brokenEdge = false;
                for(const u of unprocessedNodes){
                    const neighbors = this.adjList.get(u);
                    const index = neighbors.indexOf(targetNode);

                    if(index != -1){
                        neighbors.splice(index,1); //deleted targetNode from neighbors
                        this.inDegree.set(targetNode,this.inDegree.get(targetNode)-1);
                        brokenEdge.push({source_id:u,target_id:targetNode});
                        brokenEdge = true;
                        console.log(`Edge Broken : ${u} -> ${targetNode}`);
                        break;
                    }
                }
                for(const id of unprocessedNodes){
                    if(this.inDegree.get(id) === 0) queue.push(id);
                }

                //Mathematically not possible but programatically is!
                if(!edgeBroken){
                    console.error("Force pushing remaining nodes to break the loop.");
                    remainingNodes.forEach(id => sortedOrder.push(id));
                    break;
                }

                continue;   //reevaluation of queue loop with modified graph state
            }

            //KAHN ALGORITHM
            const u = queue.shift();
            sortedOrder.push(u);

            const neighbors = this.adjList.get(u) || [];
            for(const v of neighbors){
                this.inDegree.set(v,this.inDegree.get(v)-1);

                if(this.inDegree.get(v) === 0){
                    queue.push(v);
                }
            }
        }
        return{
            sequence: sortedOrder,
            mutated: brokenEdges.length > 0,
            brokenEdges
        };
    }
}