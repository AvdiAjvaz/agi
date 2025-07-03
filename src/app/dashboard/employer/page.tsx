import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getEmployerData(userId: string) {
  const employer = await prisma.employerProfile.findUnique({
    where: { userId },
    include: {
      jobs: {
        include: {
          applications: true,
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      internships: {
        include: {
          applications: true,
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  const totalApplications = await prisma.application.count({
    where: {
      OR: [
        {
          job: {
            employerProfileId: employer?.id
          }
        },
        {
          internship: {
            employerProfileId: employer?.id
          }
        }
      ]
    }
  });

  const activeJobs = employer?.jobs.filter((job: any) => job.isActive).length || 0;
  const activeInternships = employer?.internships.filter((internship: any) => internship.isActive).length || 0;

  return {
    employer,
    totalApplications,
    activeJobs,
    activeInternships
  };
}

export default async function EmployerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const { employer, totalApplications, activeJobs, activeInternships } = await getEmployerData(session.user.id);

  if (!employer) {
    redirect('/auth/login');
  }

  const recentJobs = employer.jobs.slice(0, 5);
  const recentInternships = employer.internships.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {employer.companyName}
              </h1>
              <p className="text-gray-600 mt-1">
                {employer.industry} • {employer.companySize}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/employer/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
              <Link href="/dashboard/employer/post-job">
                <Button>Post Job</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <div className="h-4 w-4 text-blue-600">💼</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs}</div>
              <p className="text-xs text-muted-foreground">Currently hiring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internships</CardTitle>
              <div className="h-4 w-4 text-green-600">🎓</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInternships}</div>
              <p className="text-xs text-muted-foreground">Active internships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <div className="h-4 w-4 text-orange-600">📋</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">Total received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <div className="h-4 w-4 text-purple-600">📊</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employer.jobs.length + employer.internships.length}</div>
              <p className="text-xs text-muted-foreground">Jobs & internships</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your postings and applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/employer/post-job" className="block">
                <Button className="w-full justify-start" variant="outline">
                  📝 Post New Job
                </Button>
              </Link>
              <Link href="/dashboard/employer/post-internship" className="block">
                <Button className="w-full justify-start" variant="outline">
                  🎯 Post Internship
                </Button>
              </Link>
              <Link href="/dashboard/employer/applications" className="block">
                <Button className="w-full justify-start" variant="outline">
                  📋 Review Applications
                </Button>
              </Link>
              <Link href="/dashboard/employer/candidates" className="block">
                <Button className="w-full justify-start" variant="outline">
                  👥 Browse Candidates
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>
                Your latest job opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.location}</p>
                        <p className="text-xs text-gray-500">
                          {job._count.applications} applications
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={job.isActive ? 'default' : 'secondary'}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Link href="/dashboard/employer/jobs">
                    <Button variant="outline" className="w-full">
                      View All Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No jobs posted yet</p>
                  <Link href="/dashboard/employer/post-job">
                    <Button>Post Your First Job</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Internships */}
        {recentInternships.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Internship Postings</CardTitle>
              <CardDescription>
                Your latest internship opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentInternships.map((internship: any) => (
                  <div key={internship.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{internship.title}</h4>
                    <p className="text-sm text-gray-600">{internship.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {internship._count.applications} applications
                    </p>
                    <Badge
                      variant={internship.isActive ? 'default' : 'secondary'}
                      className="mt-2"
                    >
                      {internship.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/employer/internships" className="inline-block mt-4">
                <Button variant="outline">
                  View All Internships
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Applications */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Latest applications to your postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {totalApplications > 0 
                  ? `You have ${totalApplications} total applications`
                  : 'No applications yet'
                }
              </p>
              <Link href="/dashboard/employer/applications">
                <Button>Review Applications</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
