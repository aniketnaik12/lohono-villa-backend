import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { AppDataSource } from '../data-source';
import { Villa } from '../entity/Villa';
import { getAvailableVillas } from '../services/availability.service';
import { getQuoteForVilla } from '../services/quote.service';

/**
 * GET /v1/villas/availability
 */
export async function listAvailableVillas(req: Request, res: Response) {
    const {
        check_in,
        check_out,
        page = '1',
        limit = '10',
        sort = 'avg_price_per_night',
        order = 'ASC',
        search,
        tags,
    } = req.query;

    if (!check_in || !check_out) {
        return res.status(400).json({
            error: 'invalid_request',
            message: 'check_in and check_out are required',
        });
    }

    if (
        !dayjs(check_in as string, 'YYYY-MM-DD', true).isValid() ||
        !dayjs(check_out as string, 'YYYY-MM-DD', true).isValid()
    ) {
        return res.status(400).json({
            error: 'invalid_request',
            message: 'Dates must be in YYYY-MM-DD format',
        });
    }

    if (!dayjs(check_in as string).isBefore(dayjs(check_out as string))) {
        return res.status(400).json({
            error: 'invalid_request',
            message: 'check_in must be before check_out',
        });
    }

    try {
        const result = await getAvailableVillas({
            checkIn: check_in as string,
            checkOut: check_out as string,
            page: Number(page),
            limit: Number(limit),
            sort: sort as string,
            order: order as 'ASC' | 'DESC',
            search: search ? String(search) : undefined,
            tags: tags ? String(tags).split(',') : undefined,
        });

        return res.json(result);
    } catch (error) {
        console.error('Availability API error:', error);
        return res.status(500).json({
            error: 'internal_error',
            message: 'Failed to fetch availability',
        });
    }
}

/**
 * GET /v1/villas/:villa_id/quote
 */
export async function getVillaQuote(req: Request, res: Response) {
    const { villa_id } = req.params;
    const { check_in, check_out } = req.query;

    if (!check_in || !check_out) {
        return res.status(400).json({
            error: 'invalid_request',
            message: 'check_in and check_out are required',
        });
    }

    if (
        !dayjs(check_in as string, 'YYYY-MM-DD', true).isValid() ||
        !dayjs(check_out as string, 'YYYY-MM-DD', true).isValid()
    ) {
        return res.status(400).json({
            error: 'invalid_request',
            message: 'Dates must be in YYYY-MM-DD format',
        });
    }

    if (!dayjs(check_in as string).isBefore(dayjs(check_out as string))) {
        return res.status(400).json({
            error: 'invalid_request',
            message: 'check_in must be before check_out',
        });
    }

    const villaRepo = AppDataSource.getRepository(Villa);
    const villa = await villaRepo.findOne({
        where: { id: Number(villa_id) },
    });

    if (!villa) {
        return res.status(404).json({
            error: 'not_found',
            message: 'villa_id not found',
        });
    }

    try {
        const quote = await getQuoteForVilla({
            villaId: Number(villa_id),
            checkIn: check_in as string,
            checkOut: check_out as string,
        });

        return res.json({
            villa: {
                id: villa.id,
                name: villa.name,
                location: villa.location,
                rating: villa.rating,
                review_count: villa.review_count,
                tags: villa.tags,
            },
            check_in,
            check_out,
            ...quote,
        });
    } catch (error) {
        console.error('Quote API error:', error);
        return res.status(500).json({
            error: 'internal_error',
            message: 'Failed to fetch quote',
        });
    }
}
