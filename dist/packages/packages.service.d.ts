import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesService {
    private packagesRepository;
    constructor(packagesRepository: Repository<Package>);
    create(createPackageDto: CreatePackageDto): Promise<Package>;
    findAll(): Promise<Package[]>;
    findOne(id: number): Promise<Package | null>;
    update(id: number, updatePackageDto: UpdatePackageDto): Promise<Package | null>;
    remove(id: number): Promise<void>;
}
