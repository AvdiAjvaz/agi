import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getEmployerJobs(userId: string) {
  const employer = await prisma.employerProfile.findUnique({
    where: { userId },
  });

  if (!employer) return [];

  const jobs = await prisma.job.findMany({
    where: { employerId: employer.id },
    include: {
      requiredSkills: {
        include: {
          skill: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return jobs;
}

async function toggleJobStatus(jobId: string, isActive: boolean) {
  'use server';
  
  const session = await auth();
  
  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!employer) {
    redirect('/auth/login');
  }

  // Verify job belongs to this employer
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      employerId: employer.id,
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { isActive },
  });

  redirect('/dashboard/employer/jobs');
}

interface JobsPageProps {
  searchParams: { success?: string };
}

export default async function EmployerJobsPage({ searchParams }: JobsPageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const jobs = await getEmployerJobs(session.user.id);

  const activeJobs = jobs.filter(job => job.isActive);
  const inactiveJobs = jobs.filter(job => !job.isActive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        <Link href="/dashboard/employer/post-job">
          <Button>Post New Job</Button>
        </Link>
      </div>

      {searchParams.success === 'created' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">Job posted successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800">Total Jobs</h3>
          <p className="text-2xl font-bold text-blue-900">{jobs.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800">Active Jobs</h3>
          <p className="text-2xl font-bold text-green-900">{activeJobs.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-800">Total Applications</h3>
          <p className="text-2xl font-bold text-orange-900">
            {jobs.reduce((sum, job) => sum + job._count.applications, 0)}
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first job posting to start attracting candidates.
            </p>
            <Link href="/dashboard/employer/post-job">
              <Button>Post Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Jobs</h2>
              <div className="grid gap-4">
                {activeJobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription>
                            {job.company} • {job.location} • {job.type}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">Active</Badge>
                          {job.salary && (
                            <p className="text-sm text-gray-600 mt-1">
                              €{job.salary.toLocaleString()}/year
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      {job.requiredSkills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.slice(0, 5).map((jobSkill: any) => (
                              <Badge key={jobSkill.skill.id} variant="outline">
                                {jobSkill.skill.name}
                              </Badge>
                            ))}
                            {job.requiredSkills.length > 5 && (
                              <Badge variant="outline">
                                +{job.requiredSkills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <p>{job._count.applications} applications</p>
                          <p>Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                          {job.deadline && (
                            <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/employer/jobs/${job.id}/applications`}>
                            <Button variant="outline" size="sm">
                              View Applications ({job._count.applications})
                            </Button>
                          </Link>
                          <form action={toggleJobStatus.bind(null, job.id, false)}>
                            <Button variant="outline" size="sm" type="submit">
                              Deactivate
                            </Button>
                          </form>
                          <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                            <Button size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Jobs */}
          {inactiveJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Inactive Jobs</h2>
              <div className="grid gap-4">
                {inactiveJobs.map((job: any) => (
                  <Card key={job.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription>
                            {job.company} • {job.location} • {job.type}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Inactive</Badge>
                          {job.salary && (
                            <p className="text-sm text-gray-600 mt-1">
                              €{job.salary.toLocaleString()}/year
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <p>{job._count.applications} applications</p>
                          <p>Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <form action={toggleJobStatus.bind(null, job.id, true)}>
                            <Button variant="outline" size="sm" type="submit">
                              Reactivate
                            </Button>
                          </form>
                          <Link href={`/dashboard/employer/jobs/${job.id}/applications`}>
                            <Button size="sm">
                              View Applications
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
