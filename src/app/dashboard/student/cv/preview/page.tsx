import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getStudentCVData(userId: string) {
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

export default async function CVPreviewPage() {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const student = await getStudentCVData(session.user.id);

  if (!student || !student.cv) {
    redirect('/dashboard/student/cv');
  }

  const cv = student.cv;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/student/cv">
          <Button variant="outline">← Back to CV Builder</Button>
        </Link>
        <div className="flex space-x-4">
          <Link href="/dashboard/student/cv/edit">
            <Button variant="outline">Edit CV</Button>
          </Link>
          <Button>Download PDF</Button>
        </div>
      </div>

      {/* CV Preview */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="p-8 print:p-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h1>
            <div className="mt-2 text-gray-600 space-y-1">
              <p className="flex items-center">
                <span className="font-medium">Email:</span>
                <span className="ml-2">{student.user.email}</span>
              </p>
              {student.phone && (
                <p className="flex items-center">
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{student.phone}</span>
                </p>
              )}
              <p className="flex items-center">
                <span className="font-medium">Education:</span>
                <span className="ml-2">
                  {student.major} at {student.university} (Year {student.yearOfStudy})
                </span>
              </p>
            </div>
          </div>

          {/* Professional Summary */}
          {cv.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cv.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {student.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((studentSkill: any) => (
                  <Badge key={studentSkill.skill.id} variant="secondary">
                    {studentSkill.skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {cv.experience && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Work Experience
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cv.experience}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.education && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Education
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cv.education}
              </div>
            </div>
          )}

          {/* Projects */}
          {cv.projects && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Projects
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cv.projects}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cv.certifications && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Certifications & Achievements
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cv.certifications}
              </div>
            </div>
          )}

          {/* Languages */}
          {cv.languages && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Languages
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cv.languages}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Generated by PPIS - Student Employment Platform</p>
            <p>Last updated: {new Date(cv.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          body {
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
