import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getApplications(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!student) return [];

  const applications = await prisma.application.findMany({
    where: { studentProfileId: student.id },
    include: {
      job: {
        include: {
          employerProfile: {
            select: {
              companyName: true,
            },
          },
        },
      },
      internship: {
        include: {
          employerProfile: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return applications;
}

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const applications = await getApplications(session.user.id);

  const pendingApplications = applications.filter((app: any) => app.status === 'PENDING');
  const acceptedApplications = applications.filter((app: any) => app.status === 'ACCEPTED');
  const rejectedApplications = applications.filter((app: any) => app.status === 'REJECTED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Applications</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800">Pending</h3>
            <p className="text-2xl font-bold text-yellow-900">{pendingApplications.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800">Accepted</h3>
            <p className="text-2xl font-bold text-green-900">{acceptedApplications.length}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800">Rejected</h3>
            <p className="text-2xl font-bold text-red-900">{rejectedApplications.length}</p>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring job opportunities and submit your first application.
            </p>
            <div className="space-x-4">
              <Link href="/dashboard/student/jobs">
                <Button>Browse Jobs</Button>
              </Link>
              <Link href="/dashboard/student/internships">
                <Button variant="outline">Browse Internships</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application: any) => {
            const position = application.job || application.internship;
            const isJob = !!application.job;
            
            return (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {position.title}
                        <Badge variant="outline">
                          {isJob ? 'Job' : 'Internship'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {position.employerProfile?.companyName} • {position.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        application.status === 'PENDING' ? 'default' :
                        application.status === 'ACCEPTED' ? 'default' :
                        application.status === 'REJECTED' ? 'destructive' :
                        'secondary'
                      }>
                        {application.status}
                      </Badge>
                      {(position.salary || position.compensation) && (
                        <p className="text-sm text-gray-600 mt-1">
                          €{(position.salary || position.compensation)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {application.coverLetter}
                      </p>
                    </div>
                    
                    {application.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {application.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Applied on {new Date(application.createdAt).toLocaleDateString()}
                        {application.updatedAt !== application.createdAt && (
                          <span> • Updated {new Date(application.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/student/${isJob ? 'jobs' : 'internships'}/${position.id}`}>
                          <Button variant="outline" size="sm">
                            View {isJob ? 'Job' : 'Internship'}
                          </Button>
                        </Link>
                        <Link href={`/dashboard/student/applications/${application.id}`}>
                          <Button size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
