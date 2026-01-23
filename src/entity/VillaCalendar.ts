import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { Villa } from './Villa';

@Entity('villa_calendar')
@Unique(['villa', 'date'])
@Index(['villa', 'date'])
export class VillaCalendar {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Villa, (villa) => villa.calendar, { onDelete: 'CASCADE' })
  villa!: Villa;

  @Column({ type: 'date' })
  date!: string;

  @Column({ default: true })
  is_available!: boolean;

  @Column({ type: 'int' })
  rate!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
