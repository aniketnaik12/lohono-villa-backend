import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VillaCalendar } from './VillaCalendar';

@Entity('villas')
export class Villa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  location!: string;

  @Column({ type: 'float', default: 4.5 })
  rating!: number;

  @Column({ type: 'int', default: 20 })
  review_count!: number;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];

  @OneToMany(() => VillaCalendar, (calendar) => calendar.villa)
  calendar!: VillaCalendar[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
