import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        userId: string;
        token: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        userId: any;
        token: string;
        refreshToken: string;
    }>;
    refreshToken(body: {
        refreshToken: string;
    }): Promise<{
        token: string;
        refreshToken: string;
    }>;
}
