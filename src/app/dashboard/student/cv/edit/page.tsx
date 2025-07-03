import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

async function getStudentData(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      cv: true,
    },
  });

  return student;
}

async function handleCVSubmission(formData: FormData) {
  'use server';
  
  const session = await auth();
  
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    redirect('/auth/login');
  }

  const summary = formData.get('summary') as string;
  const experience = formData.get('experience') as string;
  const education = formData.get('education') as string;
  const projects = formData.get('projects') as string;
  const certifications = formData.get('certifications') as string;
  const languages = formData.get('languages') as string;

  try {
    // Update or create CV
    await prisma.cV.upsert({
      where: { studentId: student.id },
      update: {
        summary,
        experience,
        education,
        projects,
        certifications,
        languages,
      },
      create: {
        studentId: student.id,
        summary,
        experience,
        education,
        projects,
        certifications,
        languages,
      },
    });

    redirect('/dashboard/student/cv?success=updated');
  } catch (error) {
    console.error('Error updating CV:', error);
    throw error;
  }
}

export default async function EditCVPage() {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const student = await getStudentData(session.user.id);

  if (!student) {
    redirect('/auth/login');
  }

  const cv = student.cv;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard/student/cv">
          <Button variant="outline">← Back to CV</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cv ? 'Edit Your CV' : 'Create Your CV'}</CardTitle>
          <CardDescription>
            Fill in the sections below to build your professional CV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCVSubmission} className="space-y-8">
            {/* Professional Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Professional Summary *
              </label>
              <Textarea
                id="summary"
                name="summary"
                rows={4}
                required
                defaultValue={cv?.summary || ''}
                placeholder="Write a brief professional summary highlighting your strengths, career objectives, and what makes you unique..."
              />
              <p className="text-xs text-gray-500 mt-1">
                2-3 sentences that summarize your professional background and goals
              </p>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Work Experience
              </label>
              <Textarea
                id="experience"
                name="experience"
                rows={6}
                defaultValue={cv?.experience || ''}
                placeholder="List your work experience, internships, part-time jobs, etc. Include:&#10;&#10;Job Title | Company Name | Duration&#10;• Key responsibilities and achievements&#10;• Relevant skills developed&#10;&#10;Example:&#10;Frontend Developer Intern | Tech Company | June 2024 - August 2024&#10;• Developed responsive web applications using React and TypeScript&#10;• Collaborated with design team to implement user interfaces&#10;• Participated in code reviews and agile development processes"
              />
            </div>

            {/* Education */}
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                Education *
              </label>
              <Textarea
                id="education"
                name="education"
                rows={4}
                required
                defaultValue={cv?.education || ''}
                placeholder="List your educational background:&#10;&#10;Degree | University | Year&#10;• Relevant coursework&#10;• GPA (if 3.5+)&#10;• Academic achievements&#10;&#10;Example:&#10;Bachelor of Computer Science | University of Prishtina | 2022-2026&#10;• Relevant coursework: Data Structures, Algorithms, Web Development&#10;• GPA: 3.8/4.0"
              />
            </div>

            {/* Projects */}
            <div>
              <label htmlFor="projects" className="block text-sm font-medium text-gray-700 mb-2">
                Projects
              </label>
              <Textarea
                id="projects"
                name="projects"
                rows={6}
                defaultValue={cv?.projects || ''}
                placeholder="Describe your key projects:&#10;&#10;Project Name | Technologies Used | Duration&#10;• Brief description of the project&#10;• Your role and contributions&#10;• Link to repository or demo (if available)&#10;&#10;Example:&#10;E-commerce Website | React, Node.js, MongoDB | March 2024&#10;• Developed a full-stack e-commerce platform with user authentication&#10;• Implemented shopping cart functionality and payment integration&#10;• GitHub: github.com/username/project"
              />
            </div>

            {/* Certifications */}
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
                Certifications & Achievements
              </label>
              <Textarea
                id="certifications"
                name="certifications"
                rows={3}
                defaultValue={cv?.certifications || ''}
                placeholder="List relevant certifications, awards, or achievements:&#10;&#10;• AWS Certified Cloud Practitioner | Amazon Web Services | 2024&#10;• Dean's List | University of Prishtina | Fall 2023&#10;• Google Analytics Certified | Google | 2023"
              />
            </div>

            {/* Languages */}
            <div>
              <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">
                Languages
              </label>
              <Textarea
                id="languages"
                name="languages"
                rows={3}
                defaultValue={cv?.languages || ''}
                placeholder="List languages you speak and your proficiency level:&#10;&#10;• Albanian - Native&#10;• English - Fluent (C1)&#10;• German - Intermediate (B2)&#10;• Serbian - Conversational (B1)"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 CV Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep it concise - aim for 1-2 pages maximum</li>
                <li>• Use action verbs (developed, implemented, collaborated, etc.)</li>
                <li>• Quantify achievements where possible (improved efficiency by 20%)</li>
                <li>• Tailor your CV for each application by emphasizing relevant skills</li>
                <li>• Proofread carefully for grammar and spelling errors</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Link href="/dashboard/student/cv">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                {cv ? 'Update CV' : 'Create CV'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
