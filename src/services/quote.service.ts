import { AppDataSource } from '../data-source';

interface Params {
    villaId: number;
    checkIn: string;
    checkOut: string;
}

export async function getQuoteForVilla({
    villaId,
    checkIn,
    checkOut,
}: Params) {
    // Fetch all rows in the window
    const rows = await AppDataSource.query(
        `
    SELECT
      vc.date,
      vc.rate,
      vc.is_available
    FROM villa_calendar vc
    WHERE vc."villaId" = $1
      AND vc.date >= $2
      AND vc.date < $3
    ORDER BY vc.date ASC
    `,
        [villaId, checkIn, checkOut]
    );

    // Expected number of nights
    const nightsResult = await AppDataSource.query(
        `
    SELECT COUNT(*)::int AS nights
    FROM generate_series(
      $1::date,
      ($2::date - interval '1 day'),
      interval '1 day'
    )
    `,
        [checkIn, checkOut]
    );
    const expectedNights = nightsResult[0].nights as number;

    // If any calendar rows are missing, treat as unavailable
    const hasAllRows = rows.length === expectedNights;

    const is_available =
        hasAllRows && rows.every((r: any) => r.is_available === true);

    const nightly_breakdown = rows.map((r: any) => ({
        date: r.date,
        rate: r.rate,
        is_available: r.is_available,
    }));

    let subtotal = 0;
    if (is_available) {
        subtotal = rows.reduce((sum: number, r: any) => sum + r.rate, 0);
    }

    const gst_rate = 0.18;
    const gst = is_available ? Math.round(subtotal * gst_rate) : 0;
    const total = is_available ? subtotal + gst : 0;

    return {
        nights: expectedNights,
        is_available,
        nightly_breakdown,
        subtotal,
        gst_rate,
        gst,
        total,
    };
}
