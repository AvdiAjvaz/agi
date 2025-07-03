import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getSkills() {
  const skills = await prisma.skill.findMany({
    orderBy: { name: 'asc' },
  });
  return skills;
}

async function handleJobSubmission(formData: FormData) {
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

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const requirements = formData.get('requirements') as string;
  const location = formData.get('location') as string;
  const type = formData.get('type') as string;
  const level = formData.get('level') as string;
  const salary = formData.get('salary') as string;
  const selectedSkills = formData.getAll('skills') as string[];
  const deadline = formData.get('deadline') as string;

  try {
    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        location,
        type: type as any, // Cast to enum type
        level: level as any, // Cast to enum type
        salary,
        employerProfileId: employer.id,
        deadline: deadline ? new Date(deadline) : null,
        isActive: true,
      },
    });

    // Add required skills
    if (selectedSkills.length > 0) {
      await prisma.jobSkill.createMany({
        data: selectedSkills.map(skillId => ({
          jobId: job.id,
          skillId,
        })),
      });
    }

    redirect('/dashboard/employer/jobs?success=created');
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

export default async function PostJobPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYER') {
    redirect('/auth/login');
  }

  const skills = await getSkills();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard/employer">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>
            Create a job posting to attract qualified candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleJobSubmission} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  required
                  placeholder="e.g. Prishtina, Remote, Hybrid"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select job type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select experience level</option>
                  <option value="ENTRY_LEVEL">Entry Level</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID_LEVEL">Mid Level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="EXECUTIVE">Executive</option>
                </select>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                  Salary (€/year) (Optional)
                </label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 50000"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline (Optional)
                </label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                required
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Requirements (Optional)
              </label>
              <Textarea
                id="requirements"
                name="requirements"
                rows={4}
                placeholder="List the required qualifications, experience, and skills..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {skills.map((skill: any) => (
                  <label key={skill.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="skills"
                      value={skill.id}
                      className="rounded"
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select skills that are required for this position
              </p>
            </div>

            <div className="flex justify-between">
              <Link href="/dashboard/employer">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                Post Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
