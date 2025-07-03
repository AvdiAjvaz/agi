import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import JobApplicationForm from '@/components/job-application-form';
import Link from 'next/link';

async function getInternship(id: string) {
  const internship = await prisma.internship.findUnique({
    where: { id },
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
    },
  });

  return internship;
}

async function getStudentProfile(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      cvs: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  return student;
}

async function checkIfApplied(userId: string, internshipId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) return false;

  const application = await prisma.application.findFirst({
    where: {
      studentProfileId: student.id,
      internshipId: internshipId,
    },
  });

  return !!application;
}

interface InternshipApplyPageProps {
  params: Promise<{ id: string }>;
}

export default async function InternshipApplyPage({ params }: InternshipApplyPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const resolvedParams = await params;
  const internship = await getInternship(resolvedParams.id);

  if (!internship || !internship.isActive) {
    notFound();
  }

  const hasApplied = await checkIfApplied(session.user.id, internship.id);
  
  if (hasApplied) {
    redirect(`/dashboard/student/internships/${internship.id}`);
  }

  const studentProfile = await getStudentProfile(session.user.id);

  if (!studentProfile) {
    redirect('/dashboard/student/profile');
  }

  // Check if application deadline has passed
  const isDeadlinePassed = internship.deadline && new Date() > new Date(internship.deadline);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href={`/dashboard/student/internships/${internship.id}`}>
          <Button variant="outline">← Back to Internship</Button>
        </Link>
      </div>

      {/* Internship Summary */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Apply for: {internship.title}</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {internship.duration && (
              <div>
                <span className="font-medium text-gray-900">Duration: </span>
                <span className="text-gray-700">{internship.duration}</span>
              </div>
            )}
            {internship.startDate && (
              <div>
                <span className="font-medium text-gray-900">Start Date: </span>
                <span className="text-gray-700">
                  {new Date(internship.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {internship.deadline && (
              <div>
                <span className="font-medium text-gray-900">Deadline: </span>
                <span className={isDeadlinePassed ? "text-red-600" : "text-orange-600"}>
                  {new Date(internship.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Required Skills */}
          {internship.skills.length > 0 && (
            <div className="mt-4">
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
        </CardContent>
      </Card>

      {/* Application Deadline Warning */}
      {isDeadlinePassed && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Application Deadline Passed</h3>
                <p className="text-sm text-red-700 mt-1">
                  The application deadline for this internship was {new Date(internship.deadline!).toLocaleDateString()}. 
                  You can no longer submit an application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV Check */}
      {studentProfile.cvs.length === 0 && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">CV Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to upload a CV before applying for internships.{' '}
                  <Link href="/dashboard/student/cv" className="underline hover:text-yellow-600">
                    Upload your CV here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      {!isDeadlinePassed && studentProfile.cvs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Application</CardTitle>
            <CardDescription>
              Tell the employer why you're interested in this internship and why you'd be a great fit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobApplicationForm 
              jobId={internship.id}
              jobTitle={internship.title}
              company={internship.employerProfile.companyName}
            />
          </CardContent>
        </Card>
      )}

      {/* Skills Comparison */}
      {internship.skills.length > 0 && studentProfile.skills.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Skills Match</CardTitle>
            <CardDescription>
              How your skills align with this internship's requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Required Skills</h4>
                <div className="space-y-2">
                  {internship.skills.map((skillRel: any) => {
                    const hasSkill = studentProfile.skills.some(
                      (studentSkill: any) => studentSkill.skill.name === skillRel.skill.name
                    );
                    return (
                      <div key={skillRel.id} className="flex items-center justify-between">
                        <span className="text-sm">{skillRel.skill.name}</span>
                        {hasSkill ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            ✓ You have this
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            Consider learning
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Your Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.skills.slice(0, 10).map((skillRel: any) => (
                    <Badge key={skillRel.id} variant="outline" className="text-xs">
                      {skillRel.skill.name}
                    </Badge>
                  ))}
                  {studentProfile.skills.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{studentProfile.skills.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
