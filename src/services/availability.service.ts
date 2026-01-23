import { AppDataSource } from '../data-source';

interface Params {
    checkIn: string;
    checkOut: string;
    page: number;
    limit: number;
    sort: string;
    order: 'ASC' | 'DESC';
}

export async function getAvailableVillas({
    checkIn,
    checkOut,
    page,
    limit,
    sort,
    order,
}: Params) {
    const offset = (page - 1) * limit;

    // Allowed sort fields
    const sortColumn =
        sort === 'avg_price_per_night' ? 'avg_price_per_night' : 'subtotal';

    const query = `
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
  WHERE vc.date >= $1
    AND vc.date < $2
    AND vc.is_available = true
  GROUP BY
    v.id,
    v.name,
    v.location,
    v.rating,
    v.review_count,
    v.tags
  HAVING COUNT(vc.date) = (SELECT nights FROM stay_days)
  ORDER BY ${sortColumn} ${order}
  LIMIT $3 OFFSET $4
`;


    const data = await AppDataSource.query(query, [
        checkIn,
        checkOut,
        limit,
        offset,
    ]);

    return {
        meta: {
            page,
            limit,
            total: data.length,
        },
        data,
    };
}
