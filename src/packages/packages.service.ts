import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
  ) {}

  create(createPackageDto: CreatePackageDto): Promise<Package> {
    const pkg = this.packagesRepository.create(createPackageDto);
    return this.packagesRepository.save(pkg);
  }

  findAll(): Promise<Package[]> {
    return this.packagesRepository.find({ relations: ['subscribers', 'subscriptions'] });
  }

  findOne(id: number): Promise<Package | null> {
    return this.packagesRepository.findOne({ where: { id }, relations: ['subscribers', 'subscriptions'] });
  }

  async update(id: number, updatePackageDto: UpdatePackageDto): Promise<Package | null> {
    await this.packagesRepository.update(id, updatePackageDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.packagesRepository.delete(id);
  }
}
