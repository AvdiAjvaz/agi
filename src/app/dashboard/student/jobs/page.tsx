import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

async function getJobs(searchTerm?: string) {
  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      ...(searchTerm && {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { company: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      employer: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return jobs;
}

interface JobsPageProps {
  searchParams: { search?: string };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const jobs = await getJobs(searchParams.search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Jobs</h1>
        
        {/* Search */}
        <form method="GET" className="max-w-md">
          <Input
            name="search"
            placeholder="Search jobs..."
            defaultValue={searchParams.search}
            className="w-full"
          />
          <Button type="submit" className="mt-2">
            Search
          </Button>
        </form>

        {searchParams.search && (
          <p className="text-gray-600 mt-4">
            Showing results for "{searchParams.search}" ({jobs.length} jobs found)
          </p>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {searchParams.search
                ? 'Try adjusting your search terms.'
                : 'No active job postings available at the moment.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {job.company} • {job.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {job.salary && (
                      <p className="text-lg font-semibold text-green-600">
                        €{job.salary.toLocaleString()}
                      </p>
                    )}
                    <Badge variant="secondary">
                      {job._count.applications} applicants
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {job.description}
                </p>
                
                {job.requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
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
                    <p>Job Type: {job.type}</p>
                    <p>Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                    {job.deadline && (
                      <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/student/jobs/${job.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    <Link href={`/dashboard/student/jobs/${job.id}/apply`}>
                      <Button>Apply Now</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
