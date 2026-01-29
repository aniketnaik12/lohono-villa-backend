import { AppDataSource } from '../data-source';

interface Params {
  checkIn: string;
  checkOut: string;
  page: number;
  limit: number;
  sort: string;
  order: 'ASC' | 'DESC';
  search?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export async function getAvailableVillas({
  checkIn,
  checkOut,
  page,
  limit,
  sort,
  order,
  search,
  tags,
  minPrice,
  maxPrice,
}: Params) {
  const offset = (page - 1) * limit;

  /* Allowed sort columns (SQL injection safe) */
  let sortColumn = 'avg_price_per_night';
  if (sort === 'subtotal') sortColumn = 'subtotal';
  if (sort === 'rating') sortColumn = 'v.rating';

  const params: any[] = [checkIn, checkOut];
  let paramIndex = params.length;

  /* Base availability conditions */
  let whereClause = `
    vc.date >= $1
    AND vc.date < $2
    AND vc.is_available = true
  `;

  /* Search (villa name or location) */
  if (search) {
    paramIndex++;
    whereClause += `
      AND (
        LOWER(v.name) LIKE $${paramIndex}
        OR LOWER(v.location) LIKE $${paramIndex}
      )
    `;
    params.push(`%${search.toLowerCase()}%`);
  }

  /* Tags (ANY match) */
  if (tags && tags.length > 0) {
    paramIndex++;
    whereClause += ` AND v.tags && $${paramIndex} `;
    params.push(tags);
  }

  /* Price range (per-night) */
  if (minPrice !== undefined) {
    paramIndex++;
    whereClause += ` AND vc.rate >= $${paramIndex} `;
    params.push(minPrice);
  }

  if (maxPrice !== undefined) {
    paramIndex++;
    whereClause += ` AND vc.rate <= $${paramIndex} `;
    params.push(maxPrice);
  }

  /* Main data query */
  const dataQuery = `
    WITH stay_days AS (
      SELECT COUNT(*) AS nights
      FROM generate_series(
        $1::date,
        ($2::date - interval '1 day'),
        interval '1 day'
      )
    )
    SELECT
      v.id,
      v.name,
      v.location,
      v.rating,
      v.review_count,
      v.tags,
      COUNT(vc.date) AS nights,
      SUM(vc.rate) AS subtotal,
      (SUM(vc.rate) / COUNT(vc.date)) AS avg_price_per_night
    FROM villas v
    JOIN villa_calendar vc ON vc."villaId" = v.id
    WHERE ${whereClause}
    GROUP BY
      v.id,
      v.name,
      v.location,
      v.rating,
      v.review_count,
      v.tags
    HAVING COUNT(vc.date) = (SELECT nights FROM stay_days)
    ORDER BY ${sortColumn} ${order}
    LIMIT $${paramIndex + 1}
    OFFSET $${paramIndex + 2}
  `;

  params.push(limit, offset);

  /* 🔢 Total count query (for pagination) */
  const countQuery = `
    SELECT COUNT(*) FROM (
      SELECT v.id
      FROM villas v
      JOIN villa_calendar vc ON vc."villaId" = v.id
      WHERE ${whereClause}
      GROUP BY v.id
      HAVING COUNT(vc.date) = (
        SELECT COUNT(*) FROM generate_series(
          $1::date,
          ($2::date - interval '1 day'),
          interval '1 day'
        )
      )
    ) count_query
  `;

  const [rows, countResult] = await Promise.all([
    AppDataSource.query(dataQuery, params),
    AppDataSource.query(countQuery, params.slice(0, paramIndex)),
  ]);

  const total = Number(countResult[0]?.count || 0);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: rows,
  };
}
