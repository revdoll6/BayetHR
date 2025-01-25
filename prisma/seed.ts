import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Initial job positions
  const jobPositions = [
    { name: 'Software Engineer', ar_name: 'مهندس برمجيات' },
    { name: 'Frontend Developer', ar_name: 'مطور واجهة أمامية' },
    { name: 'Backend Developer', ar_name: 'مطور خلفية' },
    { name: 'Full Stack Developer', ar_name: 'مطور شامل' },
    { name: 'UI/UX Designer', ar_name: 'مصمم واجهة المستخدم' },
    { name: 'Project Manager', ar_name: 'مدير مشروع' },
    { name: 'Business Analyst', ar_name: 'محلل أعمال' },
    { name: 'Quality Assurance Engineer', ar_name: 'مهندس ضمان الجودة' },
    { name: 'DevOps Engineer', ar_name: 'مهندس عمليات التطوير' },
    { name: 'Data Scientist', ar_name: 'عالم بيانات' },
  ];

  console.log('Start seeding job positions...');

  for (const position of jobPositions) {
    const jobPosition = await prisma.jobPosition.create({
      data: position,
    });
    console.log(`Created job position: ${jobPosition.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
