import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { calculateMatchingScore } from '@/lib/matching';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getJobRecommendations(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!student) return [];

  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    include: {
      employerProfile: true,
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
  });

  type JobWithIncludes = Awaited<ReturnType<typeof prisma.job.findMany>>[0];
  type StudentSkill = { skillId: string; level: string };
  type RequiredSkill = { skillId: string; required: boolean };
  type JobWithScore = JobWithIncludes & {
    matchingScore: number;
    skillMatches: number;
    totalSkills: number;
  };

  // Calculate matching scores
  const jobsWithScores: JobWithScore[] = jobs.map((job: JobWithIncludes) => {
    const studentSkills: StudentSkill[] = student.skills.map((s: any) => ({
      skillId: s.skill.id,
      level: s.level,
    }));

    const requiredSkills: RequiredSkill[] = job.skills.map((rs: any) => ({
      skillId: rs.skill.id,
      required: true, // Assuming all job skills are required for now
    }));

    const matchingResult = calculateMatchingScore(studentSkills, requiredSkills);

    return {
      ...job,
      matchingScore: matchingResult.score,
      skillMatches: matchingResult.skillMatches,
      totalSkills: matchingResult.totalSkills,
    };
  });

  // Sort by matching score descending
  return jobsWithScores.sort((a: JobWithScore, b: JobWithScore) => b.matchingScore - a.matchingScore);
}

export default async function JobRecommendationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const jobRecommendations = await getJobRecommendations(session.user.id);

  type JobRecommendation = Awaited<ReturnType<typeof getJobRecommendations>>[0];

  const highMatchJobs = jobRecommendations.filter((job: JobRecommendation) => job.matchingScore >= 70);
  const mediumMatchJobs = jobRecommendations.filter((job: JobRecommendation) => job.matchingScore >= 40 && job.matchingScore < 70);
  const lowMatchJobs = jobRecommendations.filter((job: JobRecommendation) => job.matchingScore < 40);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Recommendations</h1>
        <p className="text-gray-600">
          Jobs matched to your skills and profile. Improve your matching score by adding more skills!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800">High Match (70%+)</h3>
          <p className="text-2xl font-bold text-green-900">{highMatchJobs.length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800">Medium Match (40-69%)</h3>
          <p className="text-2xl font-bold text-yellow-900">{mediumMatchJobs.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800">Lower Match (&lt;40%)</h3>
          <p className="text-2xl font-bold text-gray-900">{lowMatchJobs.length}</p>
        </div>
      </div>

      {jobRecommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job recommendations available</h3>
            <p className="text-gray-600 mb-6">
              Add skills to your profile to get personalized job recommendations.
            </p>
            <Link href="/dashboard/student/profile">
              <Button>Manage Your Skills</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* High Match Jobs */}
          {highMatchJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                High Match Jobs (70%+ compatibility)
              </h2>
              <div className="grid gap-4">
                {highMatchJobs.map((job: any) => (
                  <JobCard key={job.id} job={job} matchColor="green" />
                ))}
              </div>
            </div>
          )}

          {/* Medium Match Jobs */}
          {mediumMatchJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Medium Match Jobs (40-69% compatibility)
              </h2>
              <div className="grid gap-4">
                {mediumMatchJobs.slice(0, 5).map((job: any) => (
                  <JobCard key={job.id} job={job} matchColor="yellow" />
                ))}
                {mediumMatchJobs.length > 5 && (
                  <div className="text-center">
                    <Link href="/dashboard/student/jobs">
                      <Button variant="outline">
                        View {mediumMatchJobs.length - 5} More Medium Match Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Low Match Jobs - Show fewer */}
          {lowMatchJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                Other Available Jobs
              </h2>
              <div className="grid gap-4">
                {lowMatchJobs.slice(0, 3).map((job: any) => (
                  <JobCard key={job.id} job={job} matchColor="gray" />
                ))}
                {lowMatchJobs.length > 3 && (
                  <div className="text-center">
                    <Link href="/dashboard/student/jobs">
                      <Button variant="outline">
                        View All {lowMatchJobs.length} Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, matchColor }: { job: any; matchColor: 'green' | 'yellow' | 'gray' }) {
  const matchColorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="text-lg">
              {job.employerProfile.companyName} • {job.location}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${matchColorClasses[matchColor]}`}>
              {job.matchingScore.toFixed(0)}% Match
            </div>
            {job.salary && (
              <p className="text-sm text-gray-600 mt-1">
                €{job.salary.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-2">
          {job.description}
        </p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Skill Match Progress</span>
            <span>{job.skillMatches}/{job.totalSkills} skills</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                job.matchingScore >= 70 ? 'bg-green-500' :
                job.matchingScore >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
              style={{ width: `${Math.max(10, job.matchingScore)}%` }}
            ></div>
          </div>
        </div>

        {job.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.slice(0, 5).map((jobSkill: any) => (
                <Badge key={jobSkill.skill.id} variant="outline">
                  {jobSkill.skill.name}
                </Badge>
              ))}
              {job.skills.length > 5 && (
                <Badge variant="outline">
                  +{job.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <p>{job._count.applications} applications</p>
            <p>Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
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
  );
}
