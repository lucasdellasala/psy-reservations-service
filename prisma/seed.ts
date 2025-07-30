import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.session.deleteMany();
  await prisma.availabilityWindow.deleteMany();
  await prisma.sessionType.deleteMany();
  await prisma.therapistTopic.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.topic.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create Topics
  const topics = await Promise.all([
    prisma.topic.create({ data: { name: 'Anxiety & Depression' } }),
    prisma.topic.create({ data: { name: 'Couples Therapy' } }),
    prisma.topic.create({ data: { name: 'Trauma & PTSD' } }),
    prisma.topic.create({ data: { name: 'Addiction Recovery' } }),
    prisma.topic.create({ data: { name: 'Child & Adolescent' } }),
    prisma.topic.create({ data: { name: 'Family Therapy' } }),
    prisma.topic.create({ data: { name: 'Career Counseling' } }),
    prisma.topic.create({ data: { name: 'Grief & Loss' } }),
  ]);

  console.log('📚 Created', topics.length, 'topics');

  // Create Therapists
  const therapists = await Promise.all([
    prisma.therapist.create({
      data: {
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    }),
    prisma.therapist.create({
      data: {
        name: 'Dr. Sarah Johnson',
        timezone: 'America/New_York',
      },
    }),
    prisma.therapist.create({
      data: {
        name: 'Dr. Carlos Rodríguez',
        timezone: 'Europe/Madrid',
      },
    }),
    prisma.therapist.create({
      data: {
        name: 'Dr. Emma Wilson',
        timezone: 'Europe/London',
      },
    }),
    prisma.therapist.create({
      data: {
        name: 'Dr. Alejandro Martínez',
        timezone: 'America/Mexico_City',
      },
    }),
  ]);

  console.log('👨‍⚕️ Created', therapists.length, 'therapists');

  // Create Therapist-Topic relationships
  const therapistTopics = [
    { therapistId: therapists[0].id, topicId: topics[0].id }, // María - Anxiety
    { therapistId: therapists[0].id, topicId: topics[1].id }, // María - Couples
    { therapistId: therapists[1].id, topicId: topics[2].id }, // Sarah - Trauma
    { therapistId: therapists[1].id, topicId: topics[3].id }, // Sarah - Addiction
    { therapistId: therapists[2].id, topicId: topics[4].id }, // Carlos - Child
    { therapistId: therapists[2].id, topicId: topics[5].id }, // Carlos - Family
    { therapistId: therapists[3].id, topicId: topics[0].id }, // Emma - Anxiety
    { therapistId: therapists[3].id, topicId: topics[6].id }, // Emma - Career
    { therapistId: therapists[4].id, topicId: topics[7].id }, // Alejandro - Grief
    { therapistId: therapists[4].id, topicId: topics[1].id }, // Alejandro - Couples
  ];

  await prisma.therapistTopic.createMany({ data: therapistTopics });
  console.log('🔗 Created therapist-topic relationships');

  // Create Session Types
  const sessionTypes = await Promise.all([
    // María's session types
    prisma.sessionType.create({
      data: {
        therapistId: therapists[0].id,
        name: 'Initial Consultation',
        durationMin: 60,
        priceMinor: 5000, // $50.00
      },
    }),
    prisma.sessionType.create({
      data: {
        therapistId: therapists[0].id,
        name: 'Extended Session',
        durationMin: 120,
        priceMinor: 9000, // $90.00
      },
    }),
    // Sarah's session types
    prisma.sessionType.create({
      data: {
        therapistId: therapists[1].id,
        name: 'Trauma Therapy',
        durationMin: 60,
        priceMinor: 7500, // $75.00
      },
    }),
    prisma.sessionType.create({
      data: {
        therapistId: therapists[1].id,
        name: 'Intensive Session',
        durationMin: 120,
        priceMinor: 14000, // $140.00
      },
    }),
    // Carlos's session types
    prisma.sessionType.create({
      data: {
        therapistId: therapists[2].id,
        name: 'Family Session',
        durationMin: 60,
        priceMinor: 6000, // $60.00
      },
    }),
    // Emma's session types
    prisma.sessionType.create({
      data: {
        therapistId: therapists[3].id,
        name: 'Career Counseling',
        durationMin: 60,
        priceMinor: 6500, // $65.00
      },
    }),
    prisma.sessionType.create({
      data: {
        therapistId: therapists[3].id,
        name: 'Extended Career Session',
        durationMin: 120,
        priceMinor: 12000, // $120.00
      },
    }),
    // Alejandro's session types
    prisma.sessionType.create({
      data: {
        therapistId: therapists[4].id,
        name: 'Grief Counseling',
        durationMin: 60,
        priceMinor: 5500, // $55.00
      },
    }),
  ]);

  console.log('⏰ Created', sessionTypes.length, 'session types');

  // Create Availability Windows
  const availabilityWindows = await Promise.all([
    // María (Argentina) - Monday, Wednesday, Friday
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[0].id,
        weekday: 1, // Monday
        startMin: 540, // 9:00 AM
        endMin: 1020, // 5:00 PM
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[0].id,
        weekday: 3, // Wednesday
        startMin: 540,
        endMin: 1020,
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[0].id,
        weekday: 5, // Friday
        startMin: 540,
        endMin: 780, // 1:00 PM
      },
    }),
    // Sarah (US) - Tuesday, Thursday, Saturday
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[1].id,
        weekday: 2, // Tuesday
        startMin: 600, // 10:00 AM
        endMin: 1080, // 6:00 PM
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[1].id,
        weekday: 4, // Thursday
        startMin: 600,
        endMin: 1080,
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[1].id,
        weekday: 6, // Saturday
        startMin: 600,
        endMin: 900, // 3:00 PM
      },
    }),
    // Carlos (Spain) - Monday, Wednesday, Friday
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[2].id,
        weekday: 1,
        startMin: 480, // 8:00 AM
        endMin: 960, // 4:00 PM
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[2].id,
        weekday: 3,
        startMin: 480,
        endMin: 960,
      },
    }),
    // Emma (UK) - Tuesday, Thursday
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[3].id,
        weekday: 2,
        startMin: 540,
        endMin: 1020,
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[3].id,
        weekday: 4,
        startMin: 540,
        endMin: 1020,
      },
    }),
    // Alejandro (Mexico) - Monday, Wednesday, Friday
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[4].id,
        weekday: 1,
        startMin: 600,
        endMin: 1080,
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[4].id,
        weekday: 3,
        startMin: 600,
        endMin: 1080,
      },
    }),
    prisma.availabilityWindow.create({
      data: {
        therapistId: therapists[4].id,
        weekday: 5,
        startMin: 600,
        endMin: 900,
      },
    }),
  ]);

  console.log('📅 Created', availabilityWindows.length, 'availability windows');

  // Create Sessions
  const now = DateTime.now();
  const sessions = await Promise.all([
    // Confirmed sessions
    prisma.session.create({
      data: {
        therapistId: therapists[0].id,
        sessionTypeId: sessionTypes[0].id,
        patientId: 'patient-001',
        patientName: 'Ana Silva',
        patientEmail: 'ana.silva@email.com',
        startUtc: now.plus({ days: 2, hours: 10 }).toJSDate(), // 10 AM in 2 days
        endUtc: now.plus({ days: 2, hours: 11 }).toJSDate(),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'CONFIRMED',
        idempotencyKey: 'session-001',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[1].id,
        sessionTypeId: sessionTypes[2].id,
        patientId: 'patient-002',
        patientName: 'John Smith',
        patientEmail: 'john.smith@email.com',
        startUtc: now.plus({ days: 3, hours: 14 }).toJSDate(), // 2 PM in 3 days
        endUtc: now.plus({ days: 3, hours: 15 }).toJSDate(),
        patientTz: 'America/New_York',
        status: 'CONFIRMED',
        idempotencyKey: 'session-002',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[2].id,
        sessionTypeId: sessionTypes[4].id,
        patientId: 'patient-003',
        patientName: 'Carmen López',
        patientEmail: 'carmen.lopez@email.com',
        startUtc: now.plus({ days: 1, hours: 9 }).toJSDate(), // 9 AM tomorrow
        endUtc: now.plus({ days: 1, hours: 10 }).toJSDate(),
        patientTz: 'Europe/Madrid',
        status: 'CONFIRMED',
        idempotencyKey: 'session-003',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[3].id,
        sessionTypeId: sessionTypes[5].id,
        patientId: 'patient-004',
        patientName: 'Emma Thompson',
        patientEmail: 'emma.thompson@email.com',
        startUtc: now.plus({ days: 4, hours: 11 }).toJSDate(), // 11 AM in 4 days
        endUtc: now.plus({ days: 4, hours: 12 }).toJSDate(),
        patientTz: 'Europe/London',
        status: 'CONFIRMED',
        idempotencyKey: 'session-004',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[4].id,
        sessionTypeId: sessionTypes[7].id,
        patientId: 'patient-005',
        patientName: 'Roberto García',
        patientEmail: 'roberto.garcia@email.com',
        startUtc: now.plus({ days: 5, hours: 15 }).toJSDate(), // 3 PM in 5 days
        endUtc: now.plus({ days: 5, hours: 16 }).toJSDate(),
        patientTz: 'America/Mexico_City',
        status: 'CONFIRMED',
        idempotencyKey: 'session-005',
      },
    }),
    // Pending sessions
    prisma.session.create({
      data: {
        therapistId: therapists[0].id,
        sessionTypeId: sessionTypes[1].id,
        patientId: 'patient-006',
        patientName: 'Carlos Mendoza',
        patientEmail: 'carlos.mendoza@email.com',
        startUtc: now.plus({ days: 7, hours: 14 }).toJSDate(),
        endUtc: now.plus({ days: 7, hours: 16 }).toJSDate(),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'PENDING',
        idempotencyKey: 'session-006',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[1].id,
        sessionTypeId: sessionTypes[3].id,
        patientId: 'patient-007',
        patientName: 'Lisa Johnson',
        patientEmail: 'lisa.johnson@email.com',
        startUtc: now.plus({ days: 6, hours: 10 }).toJSDate(),
        endUtc: now.plus({ days: 6, hours: 12 }).toJSDate(),
        patientTz: 'America/New_York',
        status: 'PENDING',
        idempotencyKey: 'session-007',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[2].id,
        sessionTypeId: sessionTypes[4].id,
        patientId: 'patient-008',
        patientName: 'Sofia Rodríguez',
        patientEmail: 'sofia.rodriguez@email.com',
        startUtc: now.plus({ days: 8, hours: 11 }).toJSDate(),
        endUtc: now.plus({ days: 8, hours: 12 }).toJSDate(),
        patientTz: 'Europe/Madrid',
        status: 'PENDING',
        idempotencyKey: 'session-008',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[3].id,
        sessionTypeId: sessionTypes[6].id,
        patientId: 'patient-009',
        patientName: 'David Wilson',
        patientEmail: 'david.wilson@email.com',
        startUtc: now.plus({ days: 9, hours: 13 }).toJSDate(),
        endUtc: now.plus({ days: 9, hours: 15 }).toJSDate(),
        patientTz: 'Europe/London',
        status: 'PENDING',
        idempotencyKey: 'session-009',
      },
    }),
    prisma.session.create({
      data: {
        therapistId: therapists[4].id,
        sessionTypeId: sessionTypes[7].id,
        patientId: 'patient-010',
        patientName: 'María González',
        patientEmail: 'maria.gonzalez@email.com',
        startUtc: now.plus({ days: 10, hours: 16 }).toJSDate(),
        endUtc: now.plus({ days: 10, hours: 17 }).toJSDate(),
        patientTz: 'America/Mexico_City',
        status: 'PENDING',
        idempotencyKey: 'session-010',
      },
    }),
  ]);

  console.log('📅 Created', sessions.length, 'sessions');

  console.log('✅ Database seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${topics.length} topics`);
  console.log(`   - ${therapists.length} therapists`);
  console.log(`   - ${sessionTypes.length} session types`);
  console.log(`   - ${availabilityWindows.length} availability windows`);
  console.log(`   - ${sessions.length} sessions`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
