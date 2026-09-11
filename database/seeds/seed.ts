import fs from 'fs';
import path from 'path';
import { connectDatabase } from '../../backend/src/config/database';
import { Student } from '../../backend/src/models/Student';
import { User } from '../../backend/src/models/User';
import { Branch } from '../../backend/src/models/Branch';

export async function seedDatabase() {
  const seedFile = path.resolve(process.cwd(), 'database/seeds/initial_data.json');
  if (!fs.existsSync(seedFile)) {
    throw new Error(`Seed file not found: ${seedFile}`);
  }

  const seed = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
  
  console.log('🔄 Connecting to MongoDB Atlas for seeding...');
  await connectDatabase();

  console.log('🌱 Seeding MongoDB Atlas collections (Idempotent)...');

  // 1. Seed Branch XI-B2
  if (seed.branch) {
    await Branch.findOneAndUpdate(
      { branchId: seed.branch.branchId },
      seed.branch,
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded branch: ${seed.branch.className} (${seed.branch.branchId})`);
  }

  // 2. Seed Admin Users (Capped at 2)
  if (seed.admins?.length) {
    for (const adm of seed.admins) {
      await User.findOneAndUpdate(
        { email: adm.email.toLowerCase() },
        {
          _id: adm.id || adm._id || `adm-${Date.now()}`,
          email: adm.email.toLowerCase(),
          name: adm.name,
          role: 'ADMIN',
          passwordHash: adm.passwordHash || 'Admin',
          branchId: seed.branch?.branchId || 'smansandai-xib2',
          studentId: null
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${seed.admins.length} initial admin accounts.`);
  }

  // 3. Seed Students (32 ACTIVE, 1 INACTIVE)
  if (seed.students?.length) {
    for (const std of seed.students) {
      await Student.findOneAndUpdate(
        { branchId: std.branchId, nisn: std.nisn },
        {
          _id: std._id || std.id,
          nisn: std.nisn,
          name: std.name,
          gender: std.gender,
          agama: std.agama || 'ISLAM',
          photo: std.photo || '',
          role: std.role || 'Siswa',
          xp: std.xp || 0,
          motto: std.motto || '',
          status: std.status || 'ACTIVE',
          branchId: std.branchId || seed.branch?.branchId || 'smansandai-xib2'
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${seed.students.length} students (Idempotent).`);
  }

  console.log('🎉 MongoDB Atlas database seeding completed successfully!');
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal Seed Error:', err);
      process.exit(1);
    });
}
