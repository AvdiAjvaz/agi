import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getStudentCV(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
      cv: true,
    },
  });

  return student;
}

export default async function CVPage() {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const student = await getStudentCV(session.user.id);

  if (!student) {
    redirect('/auth/login');
  }

  const hasCV = !!student.cv;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CV Builder</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your professional CV
          </p>
        </div>
        <div className="flex space-x-4">
          {hasCV && (
            <Link href="/dashboard/student/cv/preview">
              <Button variant="outline">Preview CV</Button>
            </Link>
          )}
          <Link href="/dashboard/student/cv/edit">
            <Button>{hasCV ? 'Edit CV' : 'Create CV'}</Button>
          </Link>
        </div>
      </div>

      {!hasCV ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No CV created yet</h3>
            <p className="text-gray-600 mb-6">
              Create your professional CV to apply for jobs and internships.
            </p>
            <Link href="/dashboard/student/cv/edit">
              <Button>Create Your CV</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* CV Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your CV</CardTitle>
              <CardDescription>
                Last updated: {new Date(student.cv.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                    <p><strong>Email:</strong> {student.user.email}</p>
                    <p><strong>Phone:</strong> {student.phone}</p>
                    <p><strong>University:</strong> {student.university}</p>
                    <p><strong>Major:</strong> {student.major}</p>
                    <p><strong>Year:</strong> {student.yearOfStudy}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">CV Content</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Summary:</strong> {student.cv.summary ? '✓' : '✗'}</p>
                    <p><strong>Experience:</strong> {student.cv.experience ? '✓' : '✗'}</p>
                    <p><strong>Education:</strong> {student.cv.education ? '✓' : '✗'}</p>
                    <p><strong>Projects:</strong> {student.cv.projects ? '✓' : '✗'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                {student.skills.length} skills added to your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((studentSkill: any) => (
                    <Badge key={studentSkill.skill.id} variant="secondary">
                      {studentSkill.skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No skills added yet.</p>
              )}
              <Link href="/dashboard/student/profile" className="inline-block mt-4">
                <Button variant="outline" size="sm">
                  Manage Skills
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/student/cv/edit" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    ✏️ Edit CV Content
                  </Button>
                </Link>
                <Link href="/dashboard/student/cv/preview" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    👁️ Preview CV
                  </Button>
                </Link>
                <Link href="/dashboard/student/cv/download" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    📄 Download PDF
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
