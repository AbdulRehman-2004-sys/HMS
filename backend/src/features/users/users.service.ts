import bcrypt from 'bcryptjs';
import { UserRepository } from './users.repository';
import { CreateUserDTO, UpdateUserDTO } from './users.types';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';

export class UserService {

  public static async getUsers(params: {
    search?: string;
    role?: string;
    status?: boolean;
    page: number;
    limit: number;
  }) {
    return UserRepository.findMany(params);
  }

  public static async getUser(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }

  public static async createUser(data: CreateUserDTO, creatorId: string, ipAddress?: string) {
    // Validate uniqueness
    const existing = await UserRepository.findByEmailOrUsername(data.email, data.username);
    if (existing) {
      if (existing.email === data.email) {
        throw new BadRequestError('Email address is already registered');
      }
      if (existing.username === data.username) {
        throw new BadRequestError('Username is already registered');
      }
    }

    const passwordHash = await bcrypt.hash(data.password || 'password123', 10);
    const user = await UserRepository.create({
      ...data,
      passwordHash,
    });

    if (!user) {
      throw new BadRequestError('Failed to create user account');
    }

    await logAudit({
      userId: creatorId,
      action: 'USER_CREATED',
      module: 'USER_MANAGEMENT',
      details: `Created user ${user.email} with roles: ${user.roles.join(', ')}`,
      ipAddress,
    });

    return user;
  }

  public static async updateUser(id: string, data: UpdateUserDTO, creatorId: string, ipAddress?: string) {
    // Check if user exists
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    // Validate uniqueness if email/username changed
    const existing = await UserRepository.findByEmailOrUsername(data.email, data.username);
    if (existing && existing.id !== id) {
      if (existing.email === data.email) {
        throw new BadRequestError('Email address is already registered to another account');
      }
      if (existing.username === data.username) {
        throw new BadRequestError('Username is already registered to another account');
      }
    }

    const updatedUser = await UserRepository.update(id, data);
    if (!updatedUser) {
      throw new BadRequestError('Failed to update user profile');
    }

    await logAudit({
      userId: creatorId,
      action: 'USER_UPDATED',
      module: 'USER_MANAGEMENT',
      details: `Updated profile details for user ${updatedUser.email}`,
      ipAddress,
    });

    return updatedUser;
  }

  public static async toggleUserStatus(id: string, isActive: boolean, creatorId: string, ipAddress?: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const updatedUser = await UserRepository.updateStatus(id, isActive);
    if (!updatedUser) {
      throw new BadRequestError('Failed to update user account status');
    }

    const action = isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    await logAudit({
      userId: creatorId,
      action,
      module: 'USER_MANAGEMENT',
      details: `${isActive ? 'Activated' : 'Deactivated'} user account ${updatedUser.email}`,
      ipAddress,
    });

    return updatedUser;
  }

  public static async resetUserPassword(id: string, passwordPlan: string, creatorId: string, ipAddress?: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const passwordHash = await bcrypt.hash(passwordPlan, 10);
    await UserRepository.updatePassword(id, passwordHash);

    await logAudit({
      userId: creatorId,
      action: 'USER_PASSWORD_RESET',
      module: 'USER_MANAGEMENT',
      details: `Administrative password reset for user ${user.email}`,
      ipAddress,
    });

    return true;
  }

  public static async deleteUser(id: string, creatorId: string, ipAddress?: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    // Prevent deleting self
    if (user.id === creatorId) {
      throw new BadRequestError('You cannot delete your own session terminal user account');
    }

    const deleted = await UserRepository.delete(id);
    if (!deleted) {
      throw new BadRequestError('Failed to delete user account');
    }

    await logAudit({
      userId: creatorId,
      action: 'USER_DELETED',
      module: 'USER_MANAGEMENT',
      details: `Deleted user account ${user.email}`,
      ipAddress,
    });

    return true;
  }
}
