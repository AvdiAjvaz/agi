import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create some skills
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'JavaScript', category: 'Programming' } }),
    prisma.skill.create({ data: { name: 'TypeScript', category: 'Programming' } }),
    prisma.skill.create({ data: { name: 'React', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Node.js', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'Python', category: 'Programming' } }),
    prisma.skill.create({ data: { name: 'SQL', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'Git', category: 'Tools' } }),
    prisma.skill.create({ data: { name: 'Communication', category: 'Soft Skills' } }),
  ])

  // Create test student user
  const studentPassword = await hashPassword('password123')
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  // Create student profile
  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      university: 'Tech University',
      major: 'Computer Science',
      year: 3,
      gpa: 3.8,
      bio: 'Passionate computer science student with experience in web development.',
    },
  })

  // Add skills to student
  await Promise.all([
    prisma.studentSkill.create({
      data: {
        studentProfileId: studentProfile.id,
        skillId: skills[0].id, // JavaScript
        level: 'ADVANCED',
      },
    }),
    prisma.studentSkill.create({
      data: {
        studentProfileId: studentProfile.id,
        skillId: skills[1].id, // TypeScript
        level: 'INTERMEDIATE',
      },
    }),
    prisma.studentSkill.create({
      data: {
        studentProfileId: studentProfile.id,
        skillId: skills[2].id, // React
        level: 'ADVANCED',
      },
    }),
  ])

  // Create test employer user
  const employerPassword = await hashPassword('password123')
  const employerUser = await prisma.user.create({
    data: {
      email: 'employer@example.com',
      password: employerPassword,
      role: 'EMPLOYER',
    },
  })

  // Create employer profile
  const employerProfile = await prisma.employerProfile.create({
    data: {
      userId: employerUser.id,
      companyName: 'Tech Solutions Inc.',
      description: 'Leading technology company specializing in web applications.',
      industry: 'Technology',
      size: '50-200 employees',
      location: 'San Francisco, CA',
      website: 'https://techsolutions.com',
      contactName: 'Jane Smith',
      contactPhone: '+1987654321',
    },
  })

  // Create a test job
  const job = await prisma.job.create({
    data: {
      employerProfileId: employerProfile.id,
      title: 'Frontend Developer Intern',
      description: 'Join our team as a frontend developer intern and work on exciting web applications.',
      requirements: 'Strong knowledge of JavaScript, React, and modern web development practices.',
      location: 'San Francisco, CA',
      salary: '$20-25/hour',
      type: 'PART_TIME',
      level: 'ENTRY_LEVEL',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  // Add required skills to job
  await Promise.all([
    prisma.jobSkill.create({
      data: {
        jobId: job.id,
        skillId: skills[0].id, // JavaScript
        required: true,
      },
    }),
    prisma.jobSkill.create({
      data: {
        jobId: job.id,
        skillId: skills[2].id, // React
        required: true,
      },
    }),
    prisma.jobSkill.create({
      data: {
        jobId: job.id,
        skillId: skills[1].id, // TypeScript
        required: false,
      },
    }),
  ])

  // Create an internship
  const internship = await prisma.internship.create({
    data: {
      employerProfileId: employerProfile.id,
      title: 'Summer Software Development Internship',
      description: 'Full-time summer internship program for computer science students.',
      requirements: 'Currently enrolled in Computer Science or related field. Knowledge of programming fundamentals.',
      location: 'San Francisco, CA',
      compensation: '$25/hour + benefits',
      duration: '12 weeks',
      startDate: new Date('2025-06-01'),
      deadline: new Date('2025-04-01'),
    },
  })

  // Add skills to internship
  await Promise.all([
    prisma.internshipSkill.create({
      data: {
        internshipId: internship.id,
        skillId: skills[0].id, // JavaScript
        required: true,
      },
    }),
    prisma.internshipSkill.create({
      data: {
        internshipId: internship.id,
        skillId: skills[4].id, // Python
        required: false,
      },
    }),
  ])

  console.log('Seed data created successfully!')
  console.log('Test accounts:')
  console.log('Student: student@example.com / password123')
  console.log('Employer: employer@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
