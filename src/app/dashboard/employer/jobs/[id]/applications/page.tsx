import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getJobApplications(userId: string, jobId: string) {
  const employer = await prisma.employerProfile.findUnique({
    where: { userId },
  });

  if (!employer) return null;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      employerProfileId: employer.id,
    },
    include: {
      applications: {
        include: {
          studentProfile: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
      },
    },
  });

  return job;
}

async function updateApplicationStatus(applicationId: string, status: string, jobId: string) {
  'use server';
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as any },
  });

  redirect(`/dashboard/employer/jobs/${jobId}/applications`);
}

interface JobApplicationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobApplicationsPage({ params }: JobApplicationsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const { id } = await params;
  const job = await getJobApplications(session.user.id, id);

  if (!job) {
    notFound();
  }

  const pendingApplications = job.applications.filter((app: any) => app.status === 'PENDING');
  const reviewedApplications = job.applications.filter((app: any) => app.status !== 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard/employer/jobs">
          <Button variant="outline">← Back to Jobs</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
        <p className="text-gray-600 mt-1">Applications for this position</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800">Pending Review</h3>
          <p className="text-2xl font-bold text-yellow-900">{pendingApplications.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800">Total Applications</h3>
          <p className="text-2xl font-bold text-blue-900">{job.applications.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800">Processed</h3>
          <p className="text-2xl font-bold text-green-900">{reviewedApplications.length}</p>
        </div>
      </div>

      {job.applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">
              This job hasn't received any applications yet. Make sure your job posting is active and visible to students.
            </p>
            <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
              <Button variant="outline">Edit Job Posting</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications ({pendingApplications.length})</CardTitle>
                <CardDescription>Applications waiting for your review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.map((application: any) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">
                            {application.studentProfile.firstName} {application.studentProfile.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{application.studentProfile.user.email}</p>
                          {application.studentProfile.university && (
                            <p className="text-sm text-gray-600">{application.studentProfile.university}</p>
                          )}
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      
                      {application.coverLetter && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Cover Letter:</h5>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Applied on {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                        <div className="space-x-2">
                          <form action={updateApplicationStatus.bind(null, application.id, 'REVIEWED', job.id)} className="inline">
                            <Button type="submit" variant="outline" size="sm">
                              Mark as Reviewed
                            </Button>
                          </form>
                          <form action={updateApplicationStatus.bind(null, application.id, 'INTERVIEW_SCHEDULED', job.id)} className="inline">
                            <Button type="submit" size="sm">
                              Schedule Interview
                            </Button>
                          </form>
                          <form action={updateApplicationStatus.bind(null, application.id, 'REJECTED', job.id)} className="inline">
                            <Button type="submit" variant="destructive" size="sm">
                              Reject
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviewed Applications */}
          {reviewedApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Applications ({reviewedApplications.length})</CardTitle>
                <CardDescription>Applications you have already reviewed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewedApplications.map((application: any) => (
                    <div key={application.id} className="border rounded-lg p-4 opacity-75">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {application.studentProfile.firstName} {application.studentProfile.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{application.studentProfile.user.email}</p>
                          {application.studentProfile.university && (
                            <p className="text-sm text-gray-600">{application.studentProfile.university}</p>
                          )}
                        </div>
                        <Badge variant={
                          application.status === 'ACCEPTED' ? 'default' :
                          application.status === 'REJECTED' ? 'destructive' :
                          'secondary'
                        }>
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
