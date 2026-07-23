import bcrypt from 'bcryptjs';
import { db } from './connection';
import { roles, users, userRoles, doctors, doctorAvailabilities, patients, hospitalSettings } from './schema';
import { INITIAL_ROLES } from './seeds/roles.data';
import { INITIAL_USERS } from './seeds/users.data';
import { INITIAL_DOCTORS } from './seeds/doctors.data';
import { INITIAL_PATIENTS } from './seeds/patients.data';
import { logger } from '../config/logger';
import { eq, and } from 'drizzle-orm';


async function seedDatabase() {
  logger.info('🚀 Starting Master Database Seeding Process...');

  try {
    // 1. Seed Roles
    logger.info('Seeding Roles Matrix...');
    const roleIdMap: Record<string, string> = {};

    for (const r of INITIAL_ROLES) {
      const [existing] = await db.select().from(roles).where(eq(roles.name, r.name)).limit(1);
      if (existing) {
        roleIdMap[r.name] = existing.id;
        logger.info(`Role "${r.name}" already exists.`);
      } else {
        const [inserted] = await db
          .insert(roles)
          .values({
            name: r.name,
            description: r.description,
          })
          .returning();
        roleIdMap[r.name] = inserted.id;
        logger.info(`Created role: "${r.name}"`);
      }
    }

    // 2. Seed Default Staff Accounts
    logger.info('Seeding Default Staff Accounts...');
    const userIdMap: Record<string, string> = {};

    for (const u of INITIAL_USERS) {
      let targetUserId = '';
      const [existingUser] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
      if (existingUser) {
        targetUserId = existingUser.id;
        userIdMap[u.email] = existingUser.id;
        await db.update(users).set({
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone,
        }).where(eq(users.id, existingUser.id));
        logger.info(`User "${u.email}" updated.`);
      } else {
        const passwordHash = await bcrypt.hash(u.password, 10);
        const [insertedUser] = await db
          .insert(users)
          .values({
            email: u.email,
            passwordHash,
            firstName: u.firstName,
            lastName: u.lastName,
            username: u.username,
            phone: u.phone,
            isActive: true,
          })
          .returning();

        targetUserId = insertedUser.id;
        userIdMap[u.email] = insertedUser.id;
        logger.info(`Created user: ${u.email} (${u.role})`);
      }

      // Sync primary role
      const roleId = roleIdMap[u.role];
      if (roleId) {
        const [hasRole] = await db.select().from(userRoles).where(and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleId))).limit(1);
        if (!hasRole) {
          await db.insert(userRoles).values({ userId: targetUserId, roleId });
        }
      }

      // Sync secondary role (e.g. Doctor role for Super Admin)
      if (u.secondaryRole && roleIdMap[u.secondaryRole]) {
        const secRoleId = roleIdMap[u.secondaryRole];
        const [hasSecRole] = await db.select().from(userRoles).where(and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, secRoleId))).limit(1);
        if (!hasSecRole) {
          await db.insert(userRoles).values({ userId: targetUserId, roleId: secRoleId });
        }
      }
    }


    // 3. Seed 11 Real Hospital Doctors & Availabilities
    logger.info('Seeding 11 Real Hospital Doctor Profiles & Availability Schedules...');
    const doctorRoleId = roleIdMap['Doctor'];

    for (const doc of INITIAL_DOCTORS) {
      const { availability, ...docFields } = doc;

      // Ensure a matching user exists for each doctor for login support
      let userForDoc = await db.select().from(users).where(eq(users.email, doc.email)).limit(1).then(r => r[0]);
      if (!userForDoc) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const username = doc.email.split('@')[0].replace(/\./g, '');
        const [newUser] = await db
          .insert(users)
          .values({
            email: doc.email,
            passwordHash,
            firstName: doc.firstName,
            lastName: doc.lastName,
            username,
            phone: doc.phone,
            isActive: true,
          })
          .returning();

        userForDoc = newUser;

        if (doctorRoleId) {
          await db.insert(userRoles).values({
            userId: userForDoc.id,
            roleId: doctorRoleId,
          });
        }
      }

      const [existingDoc] = await db.select().from(doctors).where(eq(doctors.email, doc.email)).limit(1);

      let doctorId = '';

      if (existingDoc) {
        doctorId = existingDoc.id;
        await db
          .update(doctors)
          .set({
            ...docFields,
            userId: userForDoc.id,
            updatedAt: new Date(),
          })
          .where(eq(doctors.id, doctorId));
        logger.info(`Updated existing doctor profile: Dr. ${doc.firstName} ${doc.lastName}`);
      } else {
        const [insertedDoc] = await db
          .insert(doctors)
          .values({
            ...docFields,
            userId: userForDoc.id,
            isActive: true,
            isDeleted: false,
          })
          .returning();

        doctorId = insertedDoc.id;
        logger.info(`Created doctor profile: Dr. ${doc.firstName} ${doc.lastName} (${doc.specialization})`);
      }

      // Seed Availability slots for this doctor
      if (availability && availability.length > 0) {
        await db.delete(doctorAvailabilities).where(eq(doctorAvailabilities.doctorId, doctorId));
        for (const slot of availability) {
          await db.insert(doctorAvailabilities).values({
            doctorId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: true,
          });
        }
      }
    }

    // 4. Seed Patients
    logger.info('Seeding Initial Patient Records...');
    const patientMap: Record<string, string> = {};
    for (const pat of INITIAL_PATIENTS) {
      const [existingPat] = await db.select().from(patients).where(eq(patients.mrNumber, pat.mrNumber)).limit(1);
      if (existingPat) {
        patientMap[pat.mrNumber] = existingPat.id;
        logger.info(`Patient "${pat.mrNumber}" already exists.`);
      } else {
        const [insertedPat] = await db
          .insert(patients)
          .values({
            ...pat,
            isActive: true,
            isDeleted: false,
          })
          .returning();
        patientMap[pat.mrNumber] = insertedPat.id;
        logger.info(`Created patient: ${pat.firstName} ${pat.lastName} (${pat.mrNumber})`);
      }
    }

    // 5. Seed Hospital Settings Profile
    logger.info('Seeding Central Hospital Settings Profile...');
    const existingSettings = await db.select().from(hospitalSettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(hospitalSettings).values({
        hospitalName: 'LALA Medical Complex',
        hospitalLogo: null,
        address: 'Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan',
        contactNumber: '+92 300 6708300',
        email: 'info@lalamedical.com',
      });
      logger.info('Created central hospital settings profile.');
    } else {
      logger.info('Hospital settings profile already exists.');
    }

    logger.info('🎉 Master Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
