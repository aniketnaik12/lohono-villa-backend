import 'reflect-metadata';
import dayjs from 'dayjs';
import { AppDataSource } from '../data-source';
import { Villa } from '../entity/Villa';
import { VillaCalendar } from '../entity/VillaCalendar';

const LOCATIONS = ['Goa', 'Lonavala', 'Alibaug', 'Coorg'];
const TAG_POOL = ['Pet-friendly', 'Event-friendly', 'Senior-friendly'];

const SEED_YEAR = Number(process.env.SEED_YEAR || 2025);

function randomTags(): string[] {
    return TAG_POOL.filter(() => Math.random() > 0.5);
}

async function seed() {
    await AppDataSource.initialize();

    const villaRepo = AppDataSource.getRepository(Villa);
    const calendarRepo = AppDataSource.getRepository(VillaCalendar);

    const existingCount = await villaRepo.count();
    if (existingCount > 0) {
        console.log('Seed data already exists. Skipping seeding.');
        process.exit(0);
    }

    console.log(`Seeding villas and availability for year ${SEED_YEAR}...`);

    for (let i = 1; i <= 50; i++) {
        const villa = villaRepo.create({
            name: `Villa ${i}`,
            location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
            rating: Number((4 + Math.random()).toFixed(1)), // 4.0 – 5.0
            review_count: Math.floor(Math.random() * 100) + 10,
            tags: randomTags(),
        });

        await villaRepo.save(villa);

        let date = dayjs(`${SEED_YEAR}-01-01`);
        const endDate = dayjs(`${SEED_YEAR}-12-31`);

        while (date.isBefore(endDate) || date.isSame(endDate)) {
            const calendar = calendarRepo.create({
                villa,
                date: date.format('YYYY-MM-DD'),
                rate: Math.floor(Math.random() * (50000 - 30000 + 1)) + 30000,
                is_available: Math.random() < 0.75, // ~75% availability
            });

            await calendarRepo.save(calendar);
            date = date.add(1, 'day');
        }
    }

    console.log('Seeding completed successfully ✅');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed ❌', err);
    process.exit(1);
});
