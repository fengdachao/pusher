import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Device } from './device.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
export declare class UsersService {
    private usersRepository;
    private devicesRepository;
    constructor(usersRepository: Repository<User>, devicesRepository: Repository<Device>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    addDevice(userId: string, createDeviceDto: CreateDeviceDto): Promise<Device>;
    removeDevice(userId: string, deviceId: string): Promise<void>;
    getUserDevices(userId: string): Promise<Device[]>;
}
