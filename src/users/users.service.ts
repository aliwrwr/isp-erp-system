import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    // Seed Super Admin role if not exists
    let superAdminRole = await this.rolesRepository.findOne({ where: { name: 'Super Admin' } });
    if (!superAdminRole) {
      superAdminRole = this.rolesRepository.create({ name: 'Super Admin' });
      superAdminRole = await this.rolesRepository.save(superAdminRole);
      this.logger.log('Created Super Admin role');
    }

    // Seed default admin user if no users exist
    const userCount = await this.usersRepository.count();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const adminUser = this.usersRepository.create({
        name: 'Admin',
        email: 'admin@isp.com',
        password: hashedPassword,
        roles: [superAdminRole],
      });
      await this.usersRepository.save(adminUser);
      this.logger.log('Created default admin user: admin@isp.com / admin123');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    let roles: Role[] = [];
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      roles = await this.rolesRepository.find({
        where: { name: In(createUserDto.roles) },
      });
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles,
    });

    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['roles'] });
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, relations: ['roles'] });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, relations: ['roles'] });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    let roles: Role[] | undefined = undefined;
    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      roles = await this.rolesRepository.find({
        where: { name: In(updateUserDto.roles) },
      });
    }

    const { roles: _, ...updateData } = updateUserDto;
    await this.usersRepository.update(id, updateData as any);
    if (roles) {
      const user = await this.usersRepository.findOne({ where: { id }, relations: ['roles'] });
      if (user) {
        user.roles = roles;
        await this.usersRepository.save(user);
      }
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
