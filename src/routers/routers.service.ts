import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
import { Router } from './entities/router.entity';

@Injectable()
export class RoutersService {
  constructor(
    @InjectRepository(Router)
    private routersRepository: Repository<Router>,
  ) {}

  create(createRouterDto: CreateRouterDto): Promise<Router> {
    const router = this.routersRepository.create(createRouterDto);
    return this.routersRepository.save(router);
  }

  findAll(): Promise<Router[]> {
    return this.routersRepository.find();
  }

  findOne(id: number): Promise<Router | null> {
    return this.routersRepository.findOneBy({ id });
  }

  async update(id: number, updateRouterDto: UpdateRouterDto): Promise<Router | null> {
    await this.routersRepository.update(id, updateRouterDto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.routersRepository.delete(id);
  }
}
