import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getInternship(id: string) {
  const internship = await prisma.internship.findUnique({
    where: { id },
    include: {
      employerProfile: {
        select: {
          companyName: true,
          industry: true,
          description: true,
          website: true,
          location: true,
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
  });

  return internship;
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

interface InternshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InternshipDetailPage({ params }: InternshipDetailPageProps) {
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/dashboard/student/internships">
          <Button variant="outline">← Back to Internships</Button>
        </Link>
        <div className="space-x-2">
          {hasApplied ? (
            <Button disabled>Applied ✓</Button>
          ) : (
            <Link href={`/dashboard/student/internships/${internship.id}/apply`}>
              <Button>Apply Now</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Internship Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{internship.title}</CardTitle>
              <CardDescription className="text-lg">
                {internship.employerProfile.companyName} • {internship.location}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">Internship</Badge>
              {internship.compensation && (
                <p className="text-lg text-green-600 font-medium">
                  {internship.compensation}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {internship.duration && (
              <div>
                <h4 className="font-medium text-gray-900">Duration</h4>
                <p className="text-gray-700">{internship.duration}</p>
              </div>
            )}
            {internship.startDate && (
              <div>
                <h4 className="font-medium text-gray-900">Start Date</h4>
                <p className="text-gray-700">
                  {new Date(internship.startDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {internship.deadline && (
              <div>
                <h4 className="font-medium text-gray-900">Application Deadline</h4>
                <p className="text-orange-600">
                  {new Date(internship.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{internship.description}</p>
            </div>
          </div>

          {internship.requirements && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{internship.requirements}</p>
              </div>
            </div>
          )}

          {internship.skills.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map((skillRel: any) => (
                  <Badge key={skillRel.id} variant="outline">
                    {skillRel.skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{internship._count.applications} applicants</span>
              <span>Posted {new Date(internship.createdAt).toLocaleDateString()}</span>
            </div>
            {hasApplied ? (
              <Badge variant="outline" className="text-green-600">
                Application Submitted
              </Badge>
            ) : (
              <Link href={`/dashboard/student/internships/${internship.id}/apply`}>
                <Button>Apply for this Internship</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>About {internship.employerProfile.companyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Industry</h4>
              <p className="text-gray-700">{internship.employerProfile.industry || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <p className="text-gray-700">{internship.employerProfile.location || 'Not specified'}</p>
            </div>
          </div>
          
          {internship.employerProfile.description && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Company Description</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {internship.employerProfile.description}
              </p>
            </div>
          )}

          {internship.employerProfile.website && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Website</h4>
              <a 
                href={internship.employerProfile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {internship.employerProfile.website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
