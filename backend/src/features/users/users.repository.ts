import { eq, and, or, like, desc, inArray, count } from 'drizzle-orm';
import { db } from '../../db/connection';
import { users, roles, userRoles } from '../../db/schema';
import { mockUsers, mockRoles, mockUserRoles } from '../auth/auth.service';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from './users.types';

export class UserRepository {
  public static async checkDb() {
    // Set connection state cache
    try {
      await db.select().from(users).limit(1);
      (global as any).authServiceDbConnected = true;
      return true;
    } catch {
      (global as any).authServiceDbConnected = false;
      return false;
    }
  }

  public static async findMany(params: {
    search?: string;
    role?: string;
    status?: boolean;
    page: number;
    limit: number;
  }) {
    const isDb = await this.checkDb();
    const offset = (params.page - 1) * params.limit;

    if (isDb) {
      // 1. Build role filter list if role specified
      let userIdFilter: string[] | undefined = undefined;
      if (params.role) {
        const matched = await db
          .select({ userId: userRoles.userId })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(roles.name, params.role));
        userIdFilter = matched.map((m) => m.userId);
        if (userIdFilter.length === 0) {
          return { users: [], total: 0 };
        }
      }

      // 2. Query matching users
      const whereCondition = and(
        params.search
          ? or(
              like(users.firstName, `%${params.search}%`),
              like(users.lastName, `%${params.search}%`),
              like(users.email, `%${params.search}%`),
              like(users.username, `%${params.search}%`)
            )
          : undefined,
        params.status !== undefined ? eq(users.isActive, params.status) : undefined,
        userIdFilter ? inArray(users.id, userIdFilter) : undefined
      );

      const dbUsers = await db.query.users.findMany({
        where: whereCondition,
        with: {
          userRoles: {
            with: {
              role: true,
            },
          },
        },
        orderBy: [desc(users.createdAt)],
        limit: params.limit,
        offset,
      });

      // 3. Count total matching
      const totalResult = await db
        .select({ value: count() })
        .from(users)
        .where(whereCondition);
      const total = totalResult[0]?.value || 0;

      const usersList: UserResponseDTO[] = dbUsers.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        username: u.username,
        isActive: u.isActive,
        roles: u.userRoles.map((ur) => ur.role.name),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));

      return { users: usersList, total };
    } else {
      // Memory Fallback
      let filtered = [...mockUsers];

      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.firstName.toLowerCase().includes(s) ||
            u.lastName.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.username.toLowerCase().includes(s)
        );
      }

      if (params.status !== undefined) {
        filtered = filtered.filter((u) => u.isActive === params.status);
      }

      if (params.role) {
        const roleObj = mockRoles.find((r) => r.name === params.role);
        if (!roleObj) {
          return { users: [], total: 0 };
        }
        const userIds = mockUserRoles
          .filter((ur) => ur.roleId === roleObj.id)
          .map((ur) => ur.userId);
        filtered = filtered.filter((u) => userIds.includes(u.id));
      }

      const total = filtered.length;
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const paginated = filtered.slice(offset, offset + params.limit);

      const usersList: UserResponseDTO[] = paginated.map((u) => {
        const roleIds = mockUserRoles.filter((ur) => ur.userId === u.id).map((ur) => ur.roleId);
        const rolesNames = mockRoles.filter((r) => roleIds.includes(r.id)).map((r) => r.name);
        return {
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone,
          username: u.username,
          isActive: u.isActive,
          roles: rolesNames,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      });

      return { users: usersList, total };
    }
  }

  public static async findById(id: string): Promise<UserResponseDTO | null> {
    const isDb = await this.checkDb();

    if (isDb) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, id),
        with: {
          userRoles: {
            with: {
              role: true,
            },
          },
        },
      });

      if (!dbUser) return null;

      return {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        phone: dbUser.phone,
        username: dbUser.username,
        isActive: dbUser.isActive,
        roles: dbUser.userRoles.map((ur) => ur.role.name),
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      };
    } else {
      const u = mockUsers.find((user) => user.id === id);
      if (!u) return null;

      const roleIds = mockUserRoles.filter((ur) => ur.userId === u.id).map((ur) => ur.roleId);
      const rolesNames = mockRoles.filter((r) => roleIds.includes(r.id)).map((r) => r.name);

      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        username: u.username,
        isActive: u.isActive,
        roles: rolesNames,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }
  }

  public static async findByEmailOrUsername(email: string, username: string) {
    const isDb = await this.checkDb();

    if (isDb) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)))
        .limit(1);
      return dbUser || null;
    } else {
      const mockUser = mockUsers.find((u) => u.email === email || u.username === username);
      return mockUser || null;
    }
  }

  public static async create(data: CreateUserDTO & { passwordHash: string }) {
    const isDb = await this.checkDb();

    if (isDb) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          phone: data.phone || null,
        })
        .returning();

      for (const roleName of data.roles) {
        const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
        if (role) {
          await db.insert(userRoles).values({
            userId: newUser.id,
            roleId: role.id,
          });
        }
      }

      return this.findById(newUser.id);
    } else {
      const id = `user-${Date.now()}`;
      const newUser = {
        id,
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        phone: data.phone || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsers.push(newUser);

      for (const roleName of data.roles) {
        const role = mockRoles.find((r) => r.name === roleName);
        if (role) {
          mockUserRoles.push({ userId: id, roleId: role.id });
        }
      }

      return this.findById(id);
    }
  }

  public static async update(id: string, data: UpdateUserDTO) {
    const isDb = await this.checkDb();

    if (isDb) {
      await db
        .update(users)
        .set({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          phone: data.phone || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      // Re-assign roles
      await db.delete(userRoles).where(eq(userRoles.userId, id));

      for (const roleName of data.roles) {
        const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
        if (role) {
          await db.insert(userRoles).values({
            userId: id,
            roleId: role.id,
          });
        }
      }

      return this.findById(id);
    } else {
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx !== -1) {
        mockUsers[idx] = {
          ...mockUsers[idx],
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          phone: data.phone || null,
          updatedAt: new Date(),
        };
      }

      // Re-assign roles
      const filteredUR = mockUserRoles.filter((ur) => ur.userId !== id);
      mockUserRoles.length = 0;
      mockUserRoles.push(...filteredUR);

      for (const roleName of data.roles) {
        const role = mockRoles.find((r) => r.name === roleName);
        if (role) {
          mockUserRoles.push({ userId: id, roleId: role.id });
        }
      }

      return this.findById(id);
    }
  }

  public static async updateStatus(id: string, isActive: boolean) {
    const isDb = await this.checkDb();

    if (isDb) {
      await db
        .update(users)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(users.id, id));
      return this.findById(id);
    } else {
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx !== -1) {
        mockUsers[idx].isActive = isActive;
        mockUsers[idx].updatedAt = new Date();
      }
      return this.findById(id);
    }
  }

  public static async updatePassword(id: string, passwordHash: string) {
    const isDb = await this.checkDb();

    if (isDb) {
      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, id));
    } else {
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx !== -1) {
        mockUsers[idx].passwordHash = passwordHash;
        mockUsers[idx].updatedAt = new Date();
      }
    }
    return true;
  }

  public static async delete(id: string) {
    const isDb = await this.checkDb();

    if (isDb) {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } else {
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx !== -1) {
        mockUsers.splice(idx, 1);
        const filteredUR = mockUserRoles.filter((ur) => ur.userId !== id);
        mockUserRoles.length = 0;
        mockUserRoles.push(...filteredUR);
        return true;
      }
      return false;
    }
  }
}
