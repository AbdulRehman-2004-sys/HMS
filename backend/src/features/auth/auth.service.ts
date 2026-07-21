import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, and } from 'drizzle-orm';
import { db } from '../../db/connection';
import { users, roles, userRoles, refreshTokens } from '../../db/schema';
import { logAudit } from '../../utils/audit';
import { env } from '../../config/env';
import { UnauthorizedError, BadRequestError } from '../../utils/errors';
import { LoginInput, RegisterInput } from './auth.schema';
import { UserSessionPayload } from '../../types/express';
import { getPermissionsForRoles } from '../../config/permissions';
import { logger } from '../../config/logger';

// In-memory mock database fallbacks if database is down
interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockRole {
  id: string;
  name: string;
  description: string | null;
}

interface MockUserRole {
  userId: string;
  roleId: string;
}

interface MockRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export const mockUsers: MockUser[] = [];
export const mockRoles: MockRole[] = [];
export const mockUserRoles: MockUserRole[] = [];
export const mockRefreshTokens: MockRefreshToken[] = [];

export class AuthService {
  private static isDbConnected = false;
  private static isInitialized = false;

  public static async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Check database connectivity
    try {
      // Run a simple query to see if database responds
      await db.select().from(users).limit(1);
      this.isDbConnected = true;
      (global as any).authServiceDbConnected = true;
      logger.info('AuthService initialized in DATABASE mode.');
    } catch (e) {
      this.isDbConnected = false;
      (global as any).authServiceDbConnected = false;
      logger.warn('AuthService database connection failed. Falling back to IN-MEMORY MOCK mode.');
      logger.error('Database connection error in AuthService:', e);
    }

    const roleNames = ['Super Admin', 'Receptionist', 'Doctor', 'Laboratory', 'Radiology', 'Billing'];

    if (this.isDbConnected) {
      try {
        // Seed roles in PostgreSQL
        for (const name of roleNames) {
          const [existing] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
          if (!existing) {
            await db.insert(roles).values({ name, description: `${name} role` });
            logger.info(`Seeded role "${name}" in database.`);
          }
        }

        // Seed default Admin
        const adminEmail = 'admin@lalamedical.com';
        const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
        if (!existingAdmin) {
          const passwordHash = await bcrypt.hash('admin123', 10);
          const [newAdmin] = await db.insert(users).values({
            email: adminEmail,
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            username: 'admin',
            phone: '1234567890',
            isActive: true,
          }).returning();

          const [adminRole] = await db.select().from(roles).where(eq(roles.name, 'Super Admin')).limit(1);
          if (adminRole && newAdmin) {
            await db.insert(userRoles).values({
              userId: newAdmin.id,
              roleId: adminRole.id,
            });
            logger.info('Seeded default admin user "admin@lalamedical.com" (password: admin123) in database.');
          }
        }

        // Seed other test accounts
        const testUsers = [
          { email: 'doctor@lalamedical.com', role: 'Doctor', first: 'John', last: 'Doe' },
          { email: 'receptionist@lalamedical.com', role: 'Receptionist', first: 'Jane', last: 'Smith' },
          { email: 'lab@lalamedical.com', role: 'Laboratory', first: 'Luke', last: 'Sky' },
          { email: 'rad@lalamedical.com', role: 'Radiology', first: 'Rachel', last: 'Green' },
          { email: 'billing@lalamedical.com', role: 'Billing', first: 'Bill', last: 'Gates' },
        ];

        for (const testUser of testUsers) {
          const [existing] = await db.select().from(users).where(eq(users.email, testUser.email)).limit(1);
          if (!existing) {
            const passwordHash = await bcrypt.hash('password123', 10);
            const [newUser] = await db.insert(users).values({
              email: testUser.email,
              passwordHash,
              firstName: testUser.first,
              lastName: testUser.last,
              username: testUser.email.split('@')[0],
              phone: '1234567890',
              isActive: true,
            }).returning();

            const [assignedRole] = await db.select().from(roles).where(eq(roles.name, testUser.role)).limit(1);
            if (assignedRole && newUser) {
              await db.insert(userRoles).values({
                userId: newUser.id,
                roleId: assignedRole.id,
              });
              logger.info(`Seeded test user "${testUser.email}" (password: password123) with role "${testUser.role}" in database.`);
            }
          }
        }
      } catch (err) {
        logger.error('Failed to seed roles and users in database:', err);
      }
    } else {
      // Seed roles in memory
      roleNames.forEach((name, i) => {
        mockRoles.push({
          id: `role-${i + 1}`,
          name,
          description: `${name} role`,
        });
      });

      // Seed default users in memory
      const adminHash = await bcrypt.hash('admin123', 10);
      const mockAdmin: MockUser = {
        id: 'user-admin',
        email: 'admin@lalamedical.com',
        passwordHash: adminHash,
        firstName: 'Super',
        lastName: 'Admin',
        username: 'admin',
        phone: '1234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(mockAdmin);
      mockUserRoles.push({ userId: mockAdmin.id, roleId: 'role-1' });
      logger.info('Seeded default admin user "admin@lalamedical.com" (password: admin123) in memory.');

      const testUsers = [
        { id: 'user-doctor', email: 'doctor@lalamedical.com', role: 'Doctor', roleId: 'role-3', first: 'John', last: 'Doe' },
        { id: 'user-receptionist', email: 'receptionist@lalamedical.com', role: 'Receptionist', roleId: 'role-2', first: 'Jane', last: 'Smith' },
        { id: 'user-lab', email: 'lab@lalamedical.com', role: 'Laboratory', roleId: 'role-4', first: 'Luke', last: 'Sky' },
        { id: 'user-rad', email: 'rad@lalamedical.com', role: 'Radiology', roleId: 'role-5', first: 'Rachel', last: 'Green' },
        { id: 'user-billing', email: 'billing@lalamedical.com', role: 'Billing', roleId: 'role-6', first: 'Bill', last: 'Gates' },
      ];

      for (const testUser of testUsers) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const mockUserItem: MockUser = {
          id: testUser.id,
          email: testUser.email,
          passwordHash,
          firstName: testUser.first,
          lastName: testUser.last,
          username: testUser.email.split('@')[0],
          phone: '1234567890',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(mockUserItem);
        mockUserRoles.push({ userId: testUser.id, roleId: testUser.roleId });
        logger.info(`Seeded test user "${testUser.email}" (password: password123) with role "${testUser.role}" in memory.`);
      }
    }
  }

  private static generateAccessToken(user: { id: string; email: string }, roles: string[], permissions: string[]): string {
    const payload: UserSessionPayload = {
      id: user.id,
      email: user.email,
      roles,
      permissions,
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY as any });
  }

  private static generateRefreshToken(user: { id: string }): string {
    const payload = { id: user.id };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY as any });
  }

  public static async login(input: LoginInput, ipAddress?: string) {
    await this.init();

    let user: any = null;
    let userRolesList: string[] = [];

    if (this.isDbConnected) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (dbUser && dbUser.isActive) {
        const isPasswordValid = await bcrypt.compare(input.password, dbUser.passwordHash);
        if (isPasswordValid) {
          user = dbUser;
          // Get user roles
          const dbUserRoles = await db
            .select({ roleName: roles.name })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, dbUser.id));
          userRolesList = dbUserRoles.map((ur) => ur.roleName);
        }
      }
    } else {
      const mockUser = mockUsers.find((u) => u.email === input.email);
      if (mockUser && mockUser.isActive) {
        const isPasswordValid = await bcrypt.compare(input.password, mockUser.passwordHash);
        if (isPasswordValid) {
          user = mockUser;
          // Get user roles
          const matchedRoleIds = mockUserRoles.filter((ur) => ur.userId === mockUser.id).map((ur) => ur.roleId);
          userRolesList = mockRoles.filter((r) => matchedRoleIds.includes(r.id)).map((r) => r.name);
        }
      }
    }

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const permissions = getPermissionsForRoles(userRolesList);
    const accessToken = this.generateAccessToken(user, userRolesList, permissions);
    const refreshToken = this.generateRefreshToken(user);

    // Save Refresh Token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    if (this.isDbConnected) {
      await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      });

      await logAudit({
        userId: user.id,
        action: 'USER_LOGIN',
        module: 'AUTH',
        ipAddress: ipAddress || null,
        details: `Successful login for user ${user.email}`,
      });
    } else {
      mockRefreshTokens.push({
        id: `rt-${Date.now()}-${Math.random()}`,
        userId: user.id,
        token: refreshToken,
        expiresAt,
        isRevoked: false,
        createdAt: new Date(),
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRolesList,
        permissions,
      },
      accessToken,
      refreshToken,
    };
  }

  public static async register(input: RegisterInput, creatorId?: string, ipAddress?: string) {
    await this.init();

    let existingUser = false;
    if (this.isDbConnected) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      existingUser = !!dbUser;
    } else {
      existingUser = mockUsers.some((u) => u.email === input.email);
    }

    if (existingUser) {
      throw new BadRequestError('Email address is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    let userId = '';
    let registeredRoles: string[] = [];

    if (this.isDbConnected) {
      // Find roles
      const foundRoles = [];
      for (const roleName of input.roles) {
        const [dbRole] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
        if (dbRole) foundRoles.push(dbRole);
      }

      if (foundRoles.length === 0) {
        throw new BadRequestError('None of the assigned roles were found');
      }

      const [newUser] = await db
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          username: input.username,
          phone: input.phone || null,
        })
        .returning();

      userId = newUser.id;
      registeredRoles = foundRoles.map((r) => r.name);

      for (const r of foundRoles) {
        await db.insert(userRoles).values({
          userId: newUser.id,
          roleId: r.id,
        });
      }

      await logAudit({
        userId: creatorId || newUser.id,
        action: 'USER_REGISTERED',
        module: 'AUTH',
        ipAddress: ipAddress || null,
        details: `Registered user ${newUser.email} with roles: ${registeredRoles.join(', ')}`,
      });
    } else {
      userId = `user-${Date.now()}`;
      const mockRoleObjects = mockRoles.filter((r) => input.roles.includes(r.name));
      if (mockRoleObjects.length === 0) {
        throw new BadRequestError('None of the assigned roles were found');
      }

      registeredRoles = mockRoleObjects.map((r) => r.name);

      const newUser: MockUser = {
        id: userId,
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        phone: input.phone || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);

      mockRoleObjects.forEach((r) => {
        mockUserRoles.push({ userId, roleId: r.id });
      });
    }

    return {
      id: userId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      roles: registeredRoles,
      permissions: getPermissionsForRoles(registeredRoles),
    };
  }

  public static async refresh(token: string) {
    await this.init();

    try {
      jwt.verify(token, env.JWT_REFRESH_SECRET);
      let user: any = null;
      let userRolesList: string[] = [];

      if (this.isDbConnected) {
        const [storedToken] = await db
          .select()
          .from(refreshTokens)
          .where(
            and(
              eq(refreshTokens.token, token),
              eq(refreshTokens.isRevoked, false)
            )
          )
          .limit(1);

        if (!storedToken || storedToken.expiresAt < new Date()) {
          throw new UnauthorizedError('Refresh token is invalid or expired');
        }

        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, storedToken.userId))
          .limit(1);

        if (!dbUser || !dbUser.isActive) {
          throw new UnauthorizedError('User account is suspended or deleted');
        }

        user = dbUser;

        const dbUserRoles = await db
          .select({ roleName: roles.name })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, dbUser.id));
        userRolesList = dbUserRoles.map((ur) => ur.roleName);

        // Revoke old refresh token
        await db
          .update(refreshTokens)
          .set({ isRevoked: true })
          .where(eq(refreshTokens.id, storedToken.id));
      } else {
        const storedToken = mockRefreshTokens.find(
          (rt) => rt.token === token && !rt.isRevoked
        );

        if (!storedToken || storedToken.expiresAt < new Date()) {
          throw new UnauthorizedError('Refresh token is invalid or expired');
        }

        const mockUser = mockUsers.find((u) => u.id === storedToken.userId);
        if (!mockUser || !mockUser.isActive) {
          throw new UnauthorizedError('User account is suspended or deleted');
        }

        user = mockUser;

        const matchedRoleIds = mockUserRoles.filter((ur) => ur.userId === mockUser.id).map((ur) => ur.roleId);
        userRolesList = mockRoles.filter((r) => matchedRoleIds.includes(r.id)).map((r) => r.name);

        // Revoke old token
        storedToken.isRevoked = true;
      }

      // Rotate tokens
      const permissions = getPermissionsForRoles(userRolesList);
      const newAccessToken = this.generateAccessToken(user, userRolesList, permissions);
      const newRefreshToken = this.generateRefreshToken(user);

      // Save new refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      if (this.isDbConnected) {
        await db.insert(refreshTokens).values({
          userId: user.id,
          token: newRefreshToken,
          expiresAt,
        });
      } else {
        mockRefreshTokens.push({
          id: `rt-${Date.now()}-${Math.random()}`,
          userId: user.id,
          token: newRefreshToken,
          expiresAt,
          isRevoked: false,
          createdAt: new Date(),
        });
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid refresh token session');
    }
  }

  public static async logout(token: string) {
    await this.init();

    if (this.isDbConnected) {
      await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.token, token));
    } else {
      const storedToken = mockRefreshTokens.find((rt) => rt.token === token);
      if (storedToken) {
        storedToken.isRevoked = true;
      }
    }
  }

  public static async getUserById(userId: string) {
    await this.init();

    let user: any = null;
    let userRolesList: string[] = [];

    if (this.isDbConnected) {
      const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (dbUser && dbUser.isActive) {
        user = dbUser;
        const dbUserRoles = await db
          .select({ roleName: roles.name })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, dbUser.id));
        userRolesList = dbUserRoles.map((ur) => ur.roleName);
      }
    } else {
      const mockUser = mockUsers.find((u) => u.id === userId && u.isActive);
      if (mockUser) {
        user = mockUser;
        const matchedRoleIds = mockUserRoles.filter((ur) => ur.userId === mockUser.id).map((ur) => ur.roleId);
        userRolesList = mockRoles.filter((r) => matchedRoleIds.includes(r.id)).map((r) => r.name);
      }
    }

    if (!user) return null;

    const permissions = getPermissionsForRoles(userRolesList);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: userRolesList,
      permissions,
    };
  }
}
