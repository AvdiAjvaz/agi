import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getStudentData(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: {
        include: {
          skill: true
        }
      },
      applications: {
        include: {
          job: true,
          internship: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  const jobsCount = await prisma.job.count({
    where: { isActive: true }
  });

  const internshipsCount = await prisma.internship.count({
    where: { isActive: true }
  });

  return {
    student,
    jobsCount,
    internshipsCount
  };
}

export default async function StudentDashboard() {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const { student, jobsCount, internshipsCount } = await getStudentData(session.user.id);

  if (!student) {
    redirect('/auth/login');
  }

  const recentApplications = student.applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-600 mt-1">
                {student.university} • {student.major} • Year {student.yearOfStudy}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/student/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
              <Link href="/dashboard/student/cv">
                <Button>Manage CV</Button>
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
              <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
              <div className="h-4 w-4 text-blue-600">💼</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobsCount}</div>
              <p className="text-xs text-muted-foreground">Active job postings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internships</CardTitle>
              <div className="h-4 w-4 text-green-600">🎓</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internshipsCount}</div>
              <p className="text-xs text-muted-foreground">Active internships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <div className="h-4 w-4 text-orange-600">📋</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.applications.length}</div>
              <p className="text-xs text-muted-foreground">Total applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <div className="h-4 w-4 text-purple-600">⚡</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.skills.length}</div>
              <p className="text-xs text-muted-foreground">Skills added</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/student/recommendations" className="block">
                <Button className="w-full justify-start" variant="outline">
                  🎯 Job Recommendations
                </Button>
              </Link>
              <Link href="/dashboard/student/jobs" className="block">
                <Button className="w-full justify-start" variant="outline">
                  🔍 Browse Jobs
                </Button>
              </Link>
              <Link href="/dashboard/student/internships" className="block">
                <Button className="w-full justify-start" variant="outline">
                  🎯 Find Internships
                </Button>
              </Link>
              <Link href="/dashboard/student/applications" className="block">
                <Button className="w-full justify-start" variant="outline">
                  📝 My Applications
                </Button>
              </Link>
              <Link href="/dashboard/student/cv" className="block">
                <Button className="w-full justify-start" variant="outline">
                  📄 CV Builder
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Your latest job and internship applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application: any) => (
                    <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {application.job?.title || application.internship?.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {application.job?.company || application.internship?.company}
                        </p>
                        <p className="text-xs text-gray-500">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === 'PENDING' ? 'default' :
                        application.status === 'ACCEPTED' ? 'default' :
                        application.status === 'REJECTED' ? 'destructive' :
                        'secondary'
                      }>
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/dashboard/student/applications">
                    <Button variant="outline" className="w-full">
                      View All Applications
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No applications yet</p>
                  <Link href="/dashboard/student/jobs">
                    <Button>Start Applying</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        {student.skills.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
              <CardDescription>
                Skills on your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((studentSkill: any) => (
                  <Badge key={studentSkill.skill.id} variant="secondary">
                    {studentSkill.skill.name}
                  </Badge>
                ))}
              </div>
              <Link href="/dashboard/student/profile" className="inline-block mt-4">
                <Button variant="outline" size="sm">
                  Manage Skills
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
