import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      employer: true,
      requiredSkills: {
        include: {
          skill: true,
        },
      },
      applications: {
        select: {
          studentId: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  return job;
}

async function getStudentId(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return student?.id;
}

interface JobDetailsPageProps {
  params: { id: string };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const job = await getJob(params.id);
  
  if (!job) {
    notFound();
  }

  const studentId = await getStudentId(session.user.id);
  const hasApplied = job.applications.some(app => app.studentId === studentId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard/student/jobs">
          <Button variant="outline">← Back to Jobs</Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{job.title}</CardTitle>
              <CardDescription className="text-xl mt-2">
                {job.company} • {job.location}
              </CardDescription>
            </div>
            <div className="text-right">
              {job.salary && (
                <p className="text-2xl font-bold text-green-600">
                  €{job.salary.toLocaleString()}
                </p>
              )}
              <Badge variant="secondary" className="mt-2">
                {job._count.applications} applicants
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900">Job Type</h4>
              <p className="text-gray-600">{job.type}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Posted Date</h4>
              <p className="text-gray-600">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
            {job.deadline && (
              <div>
                <h4 className="font-medium text-gray-900">Application Deadline</h4>
                <p className="text-gray-600">
                  {new Date(job.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {job.requirements && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </div>
            )}

            {job.requiredSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((jobSkill: any) => (
                    <Badge key={jobSkill.skill.id} variant="outline">
                      {jobSkill.skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About {job.company}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Company</h4>
              <p className="text-gray-600">{job.employer.companyName}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Industry</h4>
              <p className="text-gray-600">{job.employer.industry}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Company Size</h4>
              <p className="text-gray-600">{job.employer.companySize}</p>
            </div>
            {job.employer.website && (
              <div>
                <h4 className="font-medium text-gray-900">Website</h4>
                <a
                  href={job.employer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {job.employer.website}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="font-medium">{job.title}</p>
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
          <div>
            {hasApplied ? (
              <Button disabled>
                Already Applied
              </Button>
            ) : (
              <Link href={`/dashboard/student/jobs/${job.id}/apply`}>
                <Button size="lg">
                  Apply for this Job
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed button */}
      <div className="h-20"></div>
    </div>
  );
}
