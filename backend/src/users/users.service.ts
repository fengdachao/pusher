import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Device } from './device.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async addDevice(userId: string, createDeviceDto: CreateDeviceDto): Promise<Device> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const device = this.devicesRepository.create({
      ...createDeviceDto,
      userId,
    });

    return this.devicesRepository.save(device);
  }

  async removeDevice(userId: string, deviceId: string): Promise<void> {
    const result = await this.devicesRepository.delete({
      id: deviceId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Device not found');
    }
  }

  async getUserDevices(userId: string): Promise<Device[]> {
    return this.devicesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}