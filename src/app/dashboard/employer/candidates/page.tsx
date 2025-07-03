import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

async function getStudentProfiles(searchTerm?: string) {
  const profiles = await prisma.studentProfile.findMany({
    where: searchTerm ? {
      OR: [
        {
          firstName: {
            contains: searchTerm,
          },
        },
        {
          lastName: {
            contains: searchTerm,
          },
        },
        {
          university: {
            contains: searchTerm,
          },
        },
        {
          major: {
            contains: searchTerm,
          },
        },
      ],
    } : {},
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
      experiences: {
        orderBy: {
          startDate: 'desc',
        },
        take: 2,
      },
      educations: {
        orderBy: {
          startDate: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Limit to 50 profiles for performance
  });

  return profiles;
}

interface CandidatesPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search;
  const candidates = await getStudentProfiles(searchTerm);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Candidates</h1>
          <p className="text-gray-600 mt-1">
            Discover talented students for your opportunities
          </p>
        </div>
        <Link href="/dashboard/employer">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Candidates</CardTitle>
          <CardDescription>
            Search by name, university, or field of study
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex gap-4">
            <Input
              name="search"
              placeholder="Search candidates..."
              defaultValue={searchTerm}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
            {searchTerm && (
              <Link href="/dashboard/employer/candidates">
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
            ? `Found ${candidates.length} candidates matching "${searchTerm}"`
            : `Showing ${candidates.length} recent candidates`
          }
        </p>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No candidates found' : 'No candidates available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all candidates.'
                : 'Check back later as more students join the platform.'
              }
            </p>
            {searchTerm && (
              <Link href="/dashboard/employer/candidates">
                <Button>Browse All Candidates</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {candidates.map((candidate: any) => (
            <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {candidate.firstName} {candidate.lastName}
                    </CardTitle>
                    <CardDescription>
                      {candidate.university && candidate.major 
                        ? `${candidate.major} • ${candidate.university}`
                        : candidate.university || candidate.major || 'Student'
                      }
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {candidate.year && (
                      <Badge variant="outline">Year {candidate.year}</Badge>
                    )}
                    {candidate.gpa && candidate.gpa >= 3.5 && (
                      <p className="text-sm text-green-600 mt-1">
                        GPA: {candidate.gpa.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {candidate.bio && (
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {candidate.bio}
                  </p>
                )}

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 6).map((skillRel: any) => (
                        <Badge key={skillRel.id} variant="outline" className="text-xs">
                          {skillRel.skill.name}
                        </Badge>
                      ))}
                      {candidate.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Experience */}
                {candidate.experiences.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Experience:</h4>
                    {candidate.experiences.map((exp: any) => (
                      <div key={exp.id} className="text-sm text-gray-700">
                        <span className="font-medium">{exp.title}</span> at {exp.company}
                        <span className="text-gray-500">
                          • {new Date(exp.startDate).getFullYear()}
                          {exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : ' - Present'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {candidate.user.email}
                    </span>
                    {candidate.linkedinUrl && (
                      <a 
                        href={candidate.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {candidate.portfolioUrl && (
                      <a 
                        href={candidate.portfolioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      View Full Profile
                    </Button>
                    <Button size="sm" disabled>
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {candidates.length === 50 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Showing first 50 candidates. Use search to find specific profiles.
          </p>
        </div>
      )}
    </div>
  );
}
