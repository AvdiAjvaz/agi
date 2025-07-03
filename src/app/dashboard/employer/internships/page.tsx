import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getEmployerInternships(userId: string) {
  const employer = await prisma.employerProfile.findUnique({
    where: { userId },
  });

  if (!employer) return [];

  const internships = await prisma.internship.findMany({
    where: { employerProfileId: employer.id },
    include: {
      skills: {
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

  return internships;
}

async function toggleInternshipStatus(internshipId: string, isActive: boolean) {
  'use server';
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!employer) {
    redirect('/auth/login');
  }

  // Verify internship belongs to this employer
  const internship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      employerProfileId: employer.id,
    },
  });

  if (!internship) {
    throw new Error('Internship not found');
  }

  await prisma.internship.update({
    where: { id: internshipId },
    data: { isActive },
  });

  redirect('/dashboard/employer/internships');
}

interface InternshipsPageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function EmployerInternshipsPage({ searchParams }: InternshipsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const internships = await getEmployerInternships(session.user.id);

  type Internship = Awaited<ReturnType<typeof getEmployerInternships>>[0];

  const activeInternships = internships.filter((internship: Internship) => internship.isActive);
  const inactiveInternships = internships.filter((internship: Internship) => !internship.isActive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Internship Postings</h1>
          <p className="text-gray-600 mt-1">
            Manage your internship postings and track applications
          </p>
        </div>
        <Link href="/dashboard/employer/post-internship">
          <Button>Post New Internship</Button>
        </Link>
      </div>

      {resolvedSearchParams.success === 'created' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">Internship posted successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800">Total Internships</h3>
          <p className="text-2xl font-bold text-blue-900">{internships.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800">Active Internships</h3>
          <p className="text-2xl font-bold text-green-900">{activeInternships.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800">Inactive Internships</h3>
          <p className="text-2xl font-bold text-gray-900">{inactiveInternships.length}</p>
        </div>
      </div>

      {internships.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Internships Posted</h3>
            <p className="text-gray-600 mb-6">
              Start attracting talented interns by posting your first internship opportunity.
            </p>
            <Link href="/dashboard/employer/post-internship">
              <Button>Post Your First Internship</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Internships */}
          {activeInternships.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Active Internships ({activeInternships.length})
              </h2>
              <div className="grid gap-6">
                {activeInternships.map((internship: any) => (
                  <Card key={internship.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{internship.title}</CardTitle>
                          <CardDescription>
                            {internship.location} • {internship.duration || 'Duration not specified'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">Active</Badge>
                          {internship.compensation && (
                            <p className="text-sm text-gray-600 mt-1">
                              {internship.compensation}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {internship.description}
                      </p>
                      
                      {internship.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {internship.skills.map((skillRel: any) => (
                              <Badge key={skillRel.id} variant="outline" className="text-xs">
                                {skillRel.skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {internship._count.applications} applications
                          </span>
                          <span className="text-sm text-gray-600">
                            Posted {new Date(internship.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <Link href={`/dashboard/employer/internships/${internship.id}/applications`}>
                            <Button variant="outline" size="sm">
                              View Applications
                            </Button>
                          </Link>
                          <form action={toggleInternshipStatus.bind(null, internship.id, false)} className="inline">
                            <Button type="submit" variant="outline" size="sm">
                              Deactivate
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Internships */}
          {inactiveInternships.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Inactive Internships ({inactiveInternships.length})
              </h2>
              <div className="grid gap-6">
                {inactiveInternships.map((internship: any) => (
                  <Card key={internship.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{internship.title}</CardTitle>
                          <CardDescription>
                            {internship.location} • {internship.duration || 'Duration not specified'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Inactive</Badge>
                          {internship.compensation && (
                            <p className="text-sm text-gray-600 mt-1">
                              {internship.compensation}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {internship.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {internship._count.applications} applications
                        </span>
                        <form action={toggleInternshipStatus.bind(null, internship.id, true)} className="inline">
                          <Button type="submit" variant="outline" size="sm">
                            Reactivate
                          </Button>
                        </form>
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
