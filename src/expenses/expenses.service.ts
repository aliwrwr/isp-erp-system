import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private repo: Repository<Expense>,
  ) {}

  findAll(query: {
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, category, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const where: any = {};

    if (category && category !== 'all') where.category = category;
    if (dateFrom && dateTo) where.date = Between(dateFrom, dateTo);

    const qb = this.repo.createQueryBuilder('e');
    if (category && category !== 'all') qb.andWhere('e.category = :category', { category });
    if (dateFrom) qb.andWhere('e.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('e.date <= :dateTo', { dateTo });
    if (search) {
      qb.andWhere(
        '(e.recipientName LIKE :s OR e.description LIKE :s)',
        { s: `%${search}%` },
      );
    }

    qb.orderBy('e.date', 'DESC').addOrderBy('e.time', 'DESC');

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    return qb.skip(skip).take(take).getManyAndCount().then(([data, total]) => ({
      data,
      total,
      page: Number(page),
      pages: Math.ceil(total / take),
    }));
  }

  async stats(filters?: { search?: string; category?: string; dateFrom?: string; dateTo?: string }) {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString().slice(0, 10);

    const hasFilters = filters && (filters.dateFrom || filters.dateTo || filters.category || filters.search);

    // Build filtered query for stats when filters are active
    if (hasFilters) {
      const qb = this.repo.createQueryBuilder('e');
      if (filters.category && filters.category !== 'all')
        qb.andWhere('e.category = :category', { category: filters.category });
      if (filters.dateFrom)
        qb.andWhere('e.date >= :dateFrom', { dateFrom: filters.dateFrom });
      if (filters.dateTo)
        qb.andWhere('e.date <= :dateTo', { dateTo: filters.dateTo });
      if (filters.search)
        qb.andWhere('(e.recipientName LIKE :s OR e.description LIKE :s)', { s: `%${filters.search}%` });

      const filtered = await qb.getMany();
      const amounts = filtered.map(e => Number(e.amount));
      const total   = amounts.reduce((s, v) => s + v, 0);
      return {
        monthTotal: total,
        count:      filtered.length,
        max:        amounts.length ? Math.max(...amounts) : 0,
        min:        amounts.length ? Math.min(...amounts) : 0,
        isFiltered: true,
      };
    }

    // Default: current-month stats
    const [all, monthly] = await Promise.all([
      this.repo.find(),
      this.repo.find({ where: { date: Between(monthStart, monthEnd) } }),
    ]);

    const monthTotal = monthly.reduce((s, e) => s + Number(e.amount), 0);
    const amounts = all.map(e => Number(e.amount));
    return {
      monthTotal,
      count: monthly.length,
      max: amounts.length ? Math.max(...amounts) : 0,
      min: amounts.length ? Math.min(...amounts) : 0,
      isFiltered: false,
    };
  }

  create(dto: Partial<Expense>) {
    const e = this.repo.create(dto);
    return this.repo.save(e);
  }

  async update(id: number, dto: Partial<Expense>) {
    await this.repo.update(id, dto);
    return this.repo.findOneBy({ id });
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { ok: true };
  }
}
