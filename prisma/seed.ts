import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create job positions if they don't exist
  const jobPositions = [
    { id: 'pos1', name: 'Software Engineer', ar_name: 'مهندس برمجيات' },
    { id: 'pos2', name: 'Project Manager', ar_name: 'مدير مشروع' },
    { id: 'pos3', name: 'Business Analyst', ar_name: 'محلل أعمال' },
    { id: 'pos4', name: 'UI/UX Designer', ar_name: 'مصمم واجهات المستخدم' },
  ];

  for (const position of jobPositions) {
    await prisma.jobPosition.upsert({
      where: { id: position.id },
      update: {},
      create: position,
    });
  }

  // Get all job positions
  const positions = await prisma.jobPosition.findMany();

  // Create 20 candidates with applications
  const candidates = [];
  for (let i = 1; i <= 20; i++) {
    const email = `candidate${i}@example.com`;
    const hashedPassword = await hash('password123', 12);

    const candidate = await prisma.candidate.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        name: `Candidate ${i}`,
      },
    });

    candidates.push(candidate);

    // Create an application for each candidate
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const randomWilayaId = String(Math.floor(Math.random() * 58) + 1).padStart(2, '0');
    const statuses: ApplicationStatus[] = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];
    
    await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobPositionId: randomPosition.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        firstName: `First${i}`,
        lastName: `Last${i}`,
        birthDate: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        wilayaId: randomWilayaId,
        mobile: `+213${Math.floor(Math.random() * 900000000) + 100000000}`,
        birthCertificateNumber: `BC${Math.floor(Math.random() * 1000000)}`,
        communeId: randomWilayaId,
        experience: JSON.stringify([
          {
            title: 'Previous Role',
            company: 'Previous Company',
            startDate: '2020-01-01',
            endDate: '2022-12-31',
            description: 'Worked on various projects'
          }
        ]),
        certifications: JSON.stringify([
          { name: 'Professional Certification' }
        ]),
        softSkills: JSON.stringify([
          'Communication',
          'Leadership',
          'Problem Solving'
        ]),
        languages: JSON.stringify([
          { name: 'Arabic', level: 'Native' },
          { name: 'English', level: 'Professional' },
          { name: 'French', level: 'Intermediate' }
        ]),
        educations: {
          create: [
            {
              type: 'universitaire',
              level: 'Licence',
              institution: 'University of Algeria',
              fieldOfStudy: 'Computer Science',
              startDate: new Date('2015-09-01'),
              endDate: new Date('2019-06-30'),
              isActive: false,
              description: 'Bachelor degree in Computer Science'
            }
          ]
        }
      }
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
