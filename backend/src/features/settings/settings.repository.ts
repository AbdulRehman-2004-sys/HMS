import { db } from '../../db/connection';
import { eq, sql } from 'drizzle-orm';
import { hospitalSettings } from './settings.schema';
import { HospitalSettingsDTO, UpdateHospitalSettingsDTO } from './settings.types';

// Mock Memory Singleton Fallback
export const mockHospitalSettings: HospitalSettingsDTO = {
  id: 'set-default-001',
  hospitalName: 'LALA Medical Complex',
  hospitalLogo: null,
  address: 'Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan',
  contactNumber: '+92 300 6708300',
  email: 'info@lalamedical.com',
  updatedAt: new Date(),
};

export class SettingsRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  // Ensure table exists in PostgreSQL
  private static async ensureTableExists(): Promise<void> {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hospital_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          hospital_name VARCHAR(255) NOT NULL DEFAULT 'LALA Medical Complex',
          hospital_logo TEXT,
          address TEXT NOT NULL DEFAULT 'Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan',
          contact_number VARCHAR(50) NOT NULL DEFAULT '+92 300 6708300',
          email VARCHAR(255) DEFAULT 'info@lalamedical.com',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    } catch (err) {
      // DDL error ignore fallback
    }
  }

  // Get Central Hospital Profile (Singleton)
  public static async getSettings(): Promise<HospitalSettingsDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      try {
        await this.ensureTableExists();

        const rows = await db.select().from(hospitalSettings).limit(1);

        if (rows.length === 0) {
          // Seed initial single record
          const [inserted] = await db
            .insert(hospitalSettings)
            .values({
              hospitalName: 'LALA Medical Complex',
              hospitalLogo: null,
              address: 'Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan',
              contactNumber: '+92 300 6708300',
              email: 'info@lalamedical.com',
            })
            .returning();

          return {
            id: inserted.id,
            hospitalName: inserted.hospitalName,
            hospitalLogo: inserted.hospitalLogo ?? null,
            address: inserted.address,
            contactNumber: inserted.contactNumber,
            email: inserted.email ?? null,
            updatedAt: inserted.updatedAt,
          };
        }

        const rec = rows[0];
        return {
          id: rec.id,
          hospitalName: rec.hospitalName,
          hospitalLogo: rec.hospitalLogo ?? null,
          address: rec.address,
          contactNumber: rec.contactNumber,
          email: rec.email ?? null,
          updatedAt: rec.updatedAt,
        };
      } catch (err) {
        console.warn('Database query failed for hospital_settings, falling back to mock repository:', err);
        return { ...mockHospitalSettings };
      }
    } else {
      // Mock Fallback
      return { ...mockHospitalSettings };
    }
  }

  // Update Central Hospital Profile
  public static async updateSettings(data: UpdateHospitalSettingsDTO): Promise<HospitalSettingsDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      try {
        await this.ensureTableExists();
        const current = await this.getSettings();

        const [updated] = await db
          .update(hospitalSettings)
          .set({
            ...(data.hospitalName !== undefined && { hospitalName: data.hospitalName }),
            ...(data.hospitalLogo !== undefined && { hospitalLogo: data.hospitalLogo }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.contactNumber !== undefined && { contactNumber: data.contactNumber }),
            ...(data.email !== undefined && { email: data.email }),
            updatedAt: new Date(),
          })
          .where(eq(hospitalSettings.id, current.id))
          .returning();

        return {
          id: updated.id,
          hospitalName: updated.hospitalName,
          hospitalLogo: updated.hospitalLogo ?? null,
          address: updated.address,
          contactNumber: updated.contactNumber,
          email: updated.email ?? null,
          updatedAt: updated.updatedAt,
        };
      } catch (err) {
        console.warn('Database update failed for hospital_settings, updating mock memory:', err);
        if (data.hospitalName !== undefined) mockHospitalSettings.hospitalName = data.hospitalName;
        if (data.hospitalLogo !== undefined) mockHospitalSettings.hospitalLogo = data.hospitalLogo;
        if (data.address !== undefined) mockHospitalSettings.address = data.address;
        if (data.contactNumber !== undefined) mockHospitalSettings.contactNumber = data.contactNumber;
        if (data.email !== undefined) mockHospitalSettings.email = data.email;
        mockHospitalSettings.updatedAt = new Date();

        return { ...mockHospitalSettings };
      }
    } else {
      // Mock Memory Fallback Update
      if (data.hospitalName !== undefined) mockHospitalSettings.hospitalName = data.hospitalName;
      if (data.hospitalLogo !== undefined) mockHospitalSettings.hospitalLogo = data.hospitalLogo;
      if (data.address !== undefined) mockHospitalSettings.address = data.address;
      if (data.contactNumber !== undefined) mockHospitalSettings.contactNumber = data.contactNumber;
      if (data.email !== undefined) mockHospitalSettings.email = data.email;
      mockHospitalSettings.updatedAt = new Date();

      return { ...mockHospitalSettings };
    }
  }
}
