import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesController {
    private readonly packagesService;
    constructor(packagesService: PackagesService);
    findAll(): Promise<import("./entities/package.entity").Package[]>;
    findOne(id: string): Promise<import("./entities/package.entity").Package | null>;
    create(createPackageDto: CreatePackageDto): Promise<import("./entities/package.entity").Package>;
    update(id: string, updatePackageDto: UpdatePackageDto): Promise<import("./entities/package.entity").Package | null>;
    remove(id: string): Promise<void>;
}
