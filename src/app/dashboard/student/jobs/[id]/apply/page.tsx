import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import JobApplicationForm from '@/components/job-application-form';

async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      isActive: true,
      employerProfile: {
        select: {
          companyName: true,
        },
      },
    },
  });

  return job;
}

async function checkExistingApplication(jobId: string, userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) return false;

  const existingApplication = await prisma.application.findFirst({
    where: {
      jobId,
      studentProfileId: student.id,
    },
  });

  return !!existingApplication;
}

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const { id } = await params;
  const job = await getJob(id);
  
  if (!job || !job.isActive) {
    notFound();
  }

  const hasApplied = await checkExistingApplication(job.id, session.user.id);

  if (hasApplied) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Already Applied
          </h1>
          <p className="text-gray-600 mb-6">
            You have already submitted an application for this position.
          </p>
          <div className="space-x-4">
            <Link href={`/dashboard/student/jobs/${job.id}`}>
              <Button variant="outline">View Job Details</Button>
            </Link>
            <Link href="/dashboard/student/applications">
              <Button>View My Applications</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href={`/dashboard/student/jobs/${job.id}`}>
          <Button variant="outline">← Back to Job Details</Button>
        </Link>
      </div>

      <JobApplicationForm
        jobId={job.id}
        jobTitle={job.title}
        company={job.employerProfile.companyName}
      />
    </div>
  );
}
