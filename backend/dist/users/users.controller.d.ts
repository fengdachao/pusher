import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("./user.entity").User>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("./user.entity").User>;
    addDevice(req: any, createDeviceDto: CreateDeviceDto): Promise<import("./device.entity").Device>;
    removeDevice(req: any, deviceId: string): Promise<void>;
    getDevices(req: any): Promise<import("./device.entity").Device[]>;
}
