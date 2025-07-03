import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                PPIS
              </Link>
              
              {session.user.role === 'STUDENT' && (
                <div className="hidden md:flex space-x-6">
                  <Link href="/dashboard/student" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/student/recommendations" className="text-gray-700 hover:text-blue-600">
                    Recommendations
                  </Link>
                  <Link href="/dashboard/student/jobs" className="text-gray-700 hover:text-blue-600">
                    Jobs
                  </Link>
                  <Link href="/dashboard/student/internships" className="text-gray-700 hover:text-blue-600">
                    Internships
                  </Link>
                  <Link href="/dashboard/student/applications" className="text-gray-700 hover:text-blue-600">
                    Applications
                  </Link>
                  <Link href="/dashboard/student/cv" className="text-gray-700 hover:text-blue-600">
                    CV Builder
                  </Link>
                </div>
              )}
              
              {session.user.role === 'EMPLOYER' && (
                <div className="hidden md:flex space-x-6">
                  <Link href="/dashboard/employer" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/employer/jobs" className="text-gray-700 hover:text-blue-600">
                    My Jobs
                  </Link>
                  <Link href="/dashboard/employer/internships" className="text-gray-700 hover:text-blue-600">
                    My Internships
                  </Link>
                  <Link href="/dashboard/employer/applications" className="text-gray-700 hover:text-blue-600">
                    Applications
                  </Link>
                  <Link href="/dashboard/employer/candidates" className="text-gray-700 hover:text-blue-600">
                    Candidates
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session.user.email}
              </span>
              <form action="/api/auth/signout" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
