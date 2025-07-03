import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const applicationSchema = z.object({
  jobId: z.string().optional(),
  internshipId: z.string().optional(),
  coverLetter: z.string().min(1),
  additionalInfo: z.string().optional(),
}).refine(data => data.jobId || data.internshipId, {
  message: "Either jobId or internshipId must be provided"
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = applicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const { jobId, internshipId, coverLetter, additionalInfo } = validation.data;

    // Get student profile
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Check if job/internship exists and is active
    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || !job.isActive) {
        return NextResponse.json(
          { error: 'Job not found or inactive' },
          { status: 404 }
        );
      }

      // Check if already applied
      const existingApplication = await prisma.application.findFirst({
        where: {
          jobId,
          studentProfileId: student.id,
        },
      });

      if (existingApplication) {
        return NextResponse.json(
          { error: 'Already applied to this job' },
          { status: 400 }
        );
      }
    }

    if (internshipId) {
      const internship = await prisma.internship.findUnique({
        where: { id: internshipId },
      });

      if (!internship || !internship.isActive) {
        return NextResponse.json(
          { error: 'Internship not found or inactive' },
          { status: 404 }
        );
      }

      // Check if already applied
      const existingApplication = await prisma.application.findFirst({
        where: {
          internshipId,
          studentProfileId: student.id,
        },
      });

      if (existingApplication) {
        return NextResponse.json(
          { error: 'Already applied to this internship' },
          { status: 400 }
        );
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentProfileId: student.id,
        userId: session.user.id,
        jobId: jobId || null,
        internshipId: internshipId || null,
        coverLetter,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { message: 'Application submitted successfully', applicationId: application.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = session.user.role;

    if (role === 'STUDENT') {
      // Get student's applications
      const student = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student profile not found' },
          { status: 404 }
        );
      }

      const applications = await prisma.application.findMany({
        where: { studentProfileId: student.id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              employerProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          internship: {
            select: {
              id: true,
              title: true,
              location: true,
              employerProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(applications);
    } else if (role === 'EMPLOYER') {
      // Get applications to employer's jobs/internships
      const employer = await prisma.employerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!employer) {
        return NextResponse.json(
          { error: 'Employer profile not found' },
          { status: 404 }
        );
      }

      const applications = await prisma.application.findMany({
        where: {
          OR: [
            {
              job: {
                employerProfileId: employer.id,
              },
            },
            {
              internship: {
                employerProfileId: employer.id,
              },
            },
          ],
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
          internship: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(applications);
    }

    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
