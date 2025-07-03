import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Briefcase, TrendingUp, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <Briefcase className="h-6 w-6 mr-2" />
          <span className="font-bold">PPIS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth/login">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Platformë për Punësim dhe Internship për Studentët
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Connecting talented students with amazing career opportunities. 
                  Find your perfect job or internship with our intelligent matching system.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/auth/register?type=student">Join as Student</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/register?type=employer">Post Jobs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Users className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">Student & Employer Profiles</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive profiles for both students and employers
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <Briefcase className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">Job & Internship Posting</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Easy posting and management of opportunities
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <TrendingUp className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">Intelligent Matching</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  CV-based matching with percentage compatibility
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <Award className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">CV Builder</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Uniform CV format for easy comparison
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  About PPIS
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  PPIS (Platformë për Punësim dhe Internship për Studentët) is a modern platform 
                  designed to bridge the gap between students and employers. Our intelligent 
                  matching system ensures the best fit for both parties.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Smart CV-based matching algorithm
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Comprehensive application management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Separate portals for students and employers
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Get Started Today</h3>
                  <p className="mb-6">Join thousands of students and employers already using PPIS</p>
                  <Button variant="secondary" size="lg" className="w-full" asChild>
                    <Link href="/auth/register">Sign Up Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 PPIS. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
