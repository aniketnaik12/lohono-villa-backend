import { Router } from 'express';
import { listAvailableVillas, getVillaQuote } from '../controllers/villa.controller';

const router = Router();

router.get('/availability', listAvailableVillas);
router.get('/:villa_id/quote', getVillaQuote);

export default router;
