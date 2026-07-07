CREATE OR REPLACE FUNCTION match_concepts_batch(
  concept_embeddings vector[], 
  match_threshold float
)
RETURNS TABLE (
  id BIGSERIAL, 
  name VARCHAR,
  concept_embedding vector
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.id, c.name, c.concept_embedding
  FROM concepts c
  JOIN unnest(concept_embeddings) AS incoming_vector ON true
  WHERE (c.concept_embedding <=> incoming_vector) < (1 - match_threshold);
END;
$$;