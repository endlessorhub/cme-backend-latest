/**
 * This query updates all the facilities when needed depending on their frequency, and is divided in 5 steps:
 * - step 1: select the useful data for the query, from the user, village and facility
 * - step 2: vrt_updated -> update then select all the resources (from every village) impacted
 * - step 3: updated_facilities -> update then select the impacted facilities (last updated) to avoid re-production of resources
 * - step 4: select the results to log it if necessary
 */
export const resourcesCronQuery = `
WITH grouped_results AS (
  SELECT
    u.id user_id,
    vrt.id village_resource_type_id,
    v.id village_id,
    ft.id facility_type_id,
    ft.parameters facility_type_parameters,
    vrt.resource_type_id resource_type_id,
    f.level,
    COUNT(f.id) facility_count,
    ARRAY_AGG(f.id) facility_ids
  FROM 
      villages_resource_types vrt
  JOIN villages v ON vrt.village_id = v.id
  JOIN facility_types_resource_types ftrt ON vrt.resource_type_id = ftrt.resource_type_id
  JOIN facilities f ON vrt.village_id = f.village_id AND f.facility_type_id = ftrt.facility_type_id
  JOIN facility_types ft ON f.facility_type_id = ft.id
  JOIN users u ON v.user_id = u.id
  WHERE (
    (
      f.last_production_at IS NOT NULL AND 
      f.last_production_at < NOW() - (ft.parameters->>'frequency' || ' seconds')::interval
    ) OR
    (
      f.last_production_at IS NULL AND 
      f.created_at < NOW() - (ft.parameters->>'frequency' || ' seconds')::interval
    )
  )
  GROUP BY u.id, vrt.id, v.id, ft.id, vrt.resource_type_id, f.level
), vrt_updated AS (
  UPDATE villages_resource_types vrt
  SET
    count = count + CAST(grouped_results.facility_type_parameters->>'quantity' AS INTEGER) * grouped_results.facility_count * POWER(1 + CAST(grouped_results.facility_type_parameters->>'increase_rate' AS FLOAT), level),
    updated_at = NOW()
  FROM grouped_results
  WHERE 
    vrt.id = grouped_results.village_resource_type_id
  RETURNING grouped_results.user_id, vrt.village_id, vrt.resource_type_id AS resource_type_id, vrt.count AS count, grouped_results.facility_ids
), updated_facilities AS (
  UPDATE facilities f
  SET 
    last_production_at = NOW(),
    updated_at = NOW()
  FROM vrt_updated
  WHERE f.id = ANY(vrt_updated.facility_ids)
)

SELECT
  vrt_updated.user_id, vrt_updated.village_id, vrt_updated.resource_type_id AS resource_type_id, vrt_updated.count AS count
FROM vrt_updated
`;
