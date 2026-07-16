import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PasswordService } from '../auth/password.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersRepository } from './users.repository.js';
import type {
  PublicUser,
  UserStatusValue,
  UserWithSecret,
} from './users.types.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = new Set<UserStatusValue>([
  'ACTIVE',
  'INVITED',
  'DISABLED',
]);

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const email = this.normalizeEmail(dto.email);
    const displayName = this.normalizeDisplayName(dto.displayName);
    const status = this.normalizeStatus(dto.status);

    await this.ensureEmailAvailable(email);

    const passwordHash = dto.password
      ? await this.passwordService.hashPassword(dto.password)
      : undefined;

    const user = await this.usersRepository.create({
      email,
      displayName,
      passwordHash,
      status,
    });

    return this.toPublicUser(user);
  }

  async findMany(search?: string): Promise<PublicUser[]> {
    const users = await this.usersRepository.findMany(search?.trim());
    return users.map((user) => this.toPublicUser(user));
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.toPublicUser(user);
  }

  async findSecretByEmail(email: string): Promise<UserWithSecret | null> {
    return this.usersRepository.findByEmail(this.normalizeEmail(email));
  }

  async findSecretById(id: string): Promise<UserWithSecret | null> {
    return this.usersRepository.findById(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const currentUser = await this.usersRepository.findById(id);

    if (!currentUser) {
      throw new NotFoundException('User not found.');
    }

    const data: {
      email?: string;
      displayName?: string;
      passwordHash?: string;
      passwordChangedAt?: Date;
      status?: UserStatusValue;
    } = {};

    if (dto.email !== undefined) {
      data.email = this.normalizeEmail(dto.email);

      if (data.email !== currentUser.email) {
        await this.ensureEmailAvailable(data.email);
      }
    }

    if (dto.displayName !== undefined) {
      data.displayName = this.normalizeDisplayName(dto.displayName);
    }

    if (dto.status !== undefined) {
      data.status = this.normalizeStatus(dto.status);
    }

    if (dto.password !== undefined) {
      data.passwordHash = await this.passwordService.hashPassword(dto.password);
      data.passwordChangedAt = new Date();
    }

    const user = await this.usersRepository.update(id, data);
    return this.toPublicUser(user);
  }

  async markLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }

  async disable(id: string): Promise<PublicUser> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.toPublicUser(await this.usersRepository.disable(id));
  }

  toPublicUser(user: UserWithSecret): PublicUser {
    const { passwordHash, ...safeUser } = user;

    return {
      ...safeUser,
      hasPassword: Boolean(passwordHash),
    };
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already in use.');
    }
  }

  private normalizeEmail(email?: string): string {
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
      throw new BadRequestException('A valid email is required.');
    }

    return normalizedEmail;
  }

  private normalizeDisplayName(displayName?: string): string {
    const normalizedDisplayName = displayName?.trim();

    if (!normalizedDisplayName || normalizedDisplayName.length < 2) {
      throw new BadRequestException(
        'Display name must have at least 2 characters.',
      );
    }

    if (normalizedDisplayName.length > 120) {
      throw new BadRequestException(
        'Display name must have at most 120 characters.',
      );
    }

    return normalizedDisplayName;
  }

  private normalizeStatus(status?: UserStatusValue): UserStatusValue {
    if (!status) {
      return 'ACTIVE';
    }

    if (!VALID_STATUSES.has(status)) {
      throw new BadRequestException('Invalid user status.');
    }

    return status;
  }
}
