import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

async function getStudentData(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      cvs: true,
    },
  });

  return student;
}

async function handleCVUpload(formData: FormData) {
  'use server';
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    redirect('/auth/login');
  }

  // TODO: Implement actual file upload functionality
  // For now, just redirect back with a message
  redirect('/dashboard/student/cv?message=upload-functionality-pending');
}

export default async function EditCVPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  const student = await getStudentData(session.user.id);

  if (!student) {
    redirect('/auth/login');
  }

  const cv = student.cvs?.[0]; // Get the most recent CV

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard/student/cv">
          <Button variant="outline">← Back to CV</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cv ? 'Upload New CV' : 'Upload Your CV'}</CardTitle>
          <CardDescription>
            Upload your CV as a PDF file. This will replace your current CV if you have one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cv && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Current CV</h4>
              <p className="text-sm text-gray-600">
                <strong>File:</strong> {cv.fileName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Size:</strong> {(cv.fileSize / 1024).toFixed(1)} KB
              </p>
              <p className="text-sm text-gray-600">
                <strong>Uploaded:</strong> {new Date(cv.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <form action={handleCVUpload} className="space-y-6">
            <div>
              <label htmlFor="cv-file" className="block text-sm font-medium text-gray-700 mb-2">
                CV File (PDF) *
              </label>
              <Input
                id="cv-file"
                name="cv-file"
                type="file"
                accept=".pdf"
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please upload your CV as a PDF file (max 5MB)
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ File Upload Feature</h4>
              <p className="text-sm text-yellow-800">
                The file upload functionality is currently being implemented. For now, you can prepare your CV file and come back later to upload it.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 CV Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Save your CV as a PDF to preserve formatting</li>
                <li>• Keep it concise - aim for 1-2 pages maximum</li>
                <li>• Use clear section headers (Education, Experience, Skills, etc.)</li>
                <li>• Include your contact information at the top</li>
                <li>• Use a professional, clean design</li>
                <li>• Proofread carefully for grammar and spelling errors</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Link href="/dashboard/student/cv">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled>
                Upload CV (Coming Soon)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
