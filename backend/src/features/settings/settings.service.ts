import fs from 'fs';
import path from 'path';
import { SettingsRepository } from './settings.repository';
import { HospitalSettingsDTO, UpdateHospitalSettingsDTO } from './settings.types';
import { db } from '../../db/connection';
import { auditLogs } from '../../db/schema';

// Helper to save uploaded Base64 logo into public/uploads directory and return image URL link
function processAndSaveLogo(logoData: string | null | undefined): string | null | undefined {
  if (logoData === undefined) return undefined;
  if (logoData === null || logoData === '') return null;

  // If already a URL link, return as is
  if (logoData.startsWith('http://') || logoData.startsWith('https://') || logoData.startsWith('/uploads/')) {
    return logoData;
  }

  // If base64 data string, write to public/uploads directory
  if (logoData.startsWith('data:image')) {
    try {
      const uploadsDir = path.join(__dirname, '../../../public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const matches = logoData.match(/^data:image\/([a-zA-Z0-9+.=-]+);base64,(.+)$/);
      if (matches) {
        let ext = matches[1];
        if (ext === 'svg+xml') ext = 'svg';
        if (ext === 'jpeg') ext = 'jpg';

        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `logo-${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);

        const port = process.env.PORT || 5000;
        return `http://localhost:${port}/uploads/${filename}`;
      }
    } catch (err) {
      console.error('Error saving logo file to public/uploads folder:', err);
    }
  }

  return logoData;
}

export class SettingsService {
  public static async getSettings(): Promise<HospitalSettingsDTO> {
    return SettingsRepository.getSettings();
  }

  public static async updateSettings(
    data: UpdateHospitalSettingsDTO,
    userId?: string
  ): Promise<HospitalSettingsDTO> {
    // Process logo upload to public/uploads static folder
    if (data.hospitalLogo !== undefined) {
      data.hospitalLogo = processAndSaveLogo(data.hospitalLogo);
    }

    const updated = await SettingsRepository.updateSettings(data);

    // Audit Logging
    try {
      const isDb = (global as any).authServiceDbConnected ?? false;
      if (isDb && userId) {
        await db.insert(auditLogs).values({
          userId,
          action: 'UPDATE_HOSPITAL_SETTINGS',
          module: 'SETTINGS',
          details: `Updated hospital settings profile: ${updated.hospitalName}`,
        });
      }
    } catch (err) {
      // Ignore audit failure
    }

    return updated;
  }
}
