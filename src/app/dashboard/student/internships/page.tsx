import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

async function getInternships(searchTerm?: string) {
  const internships = await prisma.internship.findMany({
    where: {
      isActive: true,
      ...(searchTerm && {
        OR: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            description: {
              contains: searchTerm,
            },
          },
          {
            location: {
              contains: searchTerm,
            },
          },
        ],
      }),
    },
    include: {
      employerProfile: {
        select: {
          companyName: true,
          industry: true,
        },
      },
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return internships;
}

async function getStudentApplications(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) return [];

  const applications = await prisma.application.findMany({
    where: {
      studentProfileId: student.id,
      internshipId: { not: null },
    },
    select: {
      internshipId: true,
    },
  });

  return applications.map((app: any) => app.internshipId);
}

interface InternshipsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function StudentInternshipsPage({ searchParams }: InternshipsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search;
  const internships = await getInternships(searchTerm);
  const appliedInternshipIds = await getStudentApplications(session.user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internship Opportunities</h1>
          <p className="text-gray-600 mt-1">
            Discover internships that match your skills and interests
          </p>
        </div>
        <Link href="/dashboard/student">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Internships</CardTitle>
          <CardDescription>
            Find internships by title, company, or location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex gap-4">
            <Input
              name="search"
              placeholder="Search internships..."
              defaultValue={searchTerm}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
            {searchTerm && (
              <Link href="/dashboard/student/internships">
                <Button variant="outline">Clear</Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          {searchTerm 
            ? `Found ${internships.length} internships matching "${searchTerm}"`
            : `Showing ${internships.length} available internships`
          }
        </p>
      </div>

      {internships.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No internships found' : 'No internships available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all internships.'
                : 'Check back later as employers post new internship opportunities.'
              }
            </p>
            {searchTerm && (
              <Link href="/dashboard/student/internships">
                <Button>Browse All Internships</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {internships.map((internship: any) => {
            const hasApplied = appliedInternshipIds.includes(internship.id);
            
            return (
              <Card key={internship.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{internship.title}</CardTitle>
                      <CardDescription>
                        {internship.employerProfile.companyName} • {internship.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Internship</Badge>
                      {internship.compensation && (
                        <p className="text-sm text-green-600 mt-1">
                          {internship.compensation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {internship.description}
                  </p>

                  {/* Duration */}
                  {internship.duration && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-900">Duration: </span>
                      <span className="text-sm text-gray-700">{internship.duration}</span>
                    </div>
                  )}

                  {/* Start Date */}
                  {internship.startDate && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-900">Start Date: </span>
                      <span className="text-sm text-gray-700">
                        {new Date(internship.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Skills */}
                  {internship.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {internship.skills.slice(0, 6).map((skillRel: any) => (
                          <Badge key={skillRel.id} variant="outline" className="text-xs">
                            {skillRel.skill.name}
                          </Badge>
                        ))}
                        {internship.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{internship.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {internship._count.applications} applicants
                      </span>
                      <span className="text-sm text-gray-600">
                        Posted {new Date(internship.createdAt).toLocaleDateString()}
                      </span>
                      {internship.deadline && (
                        <span className="text-sm text-orange-600">
                          Deadline: {new Date(internship.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Link href={`/dashboard/student/internships/${internship.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {hasApplied ? (
                        <Button disabled size="sm">
                          Applied ✓
                        </Button>
                      ) : (
                        <Link href={`/dashboard/student/internships/${internship.id}/apply`}>
                          <Button size="sm">
                            Apply Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Looking for More Opportunities?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/student/jobs">
              <Button variant="outline">Browse Jobs</Button>
            </Link>
            <Link href="/dashboard/student/applications">
              <Button variant="outline">My Applications</Button>
            </Link>
            <Link href="/dashboard/student/cv">
              <Button variant="outline">Update CV</Button>
            </Link>
            <Link href="/dashboard/student/recommendations">
              <Button variant="outline">Get Recommendations</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
