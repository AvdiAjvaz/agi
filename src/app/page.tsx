import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-sm">
        <Link className="flex items-center justify-center" href="/">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl text-gray-900">PPIS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#about">
            About
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900">
                  Platformë për Punësim dhe Internship
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Connect students with employers through intelligent matching, professional CV building, 
                  and streamlined application management.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth/register?role=student">
                  <Button size="lg" className="w-full sm:w-auto">
                    I am a Student
                  </Button>
                </Link>
                <Link href="/auth/register?role=employer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    I am an Employer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">
                Key Features
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-lg mt-4">
                Everything you need to find the perfect job or the ideal candidate
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* For Students */}
              <Card className="border-blue-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <CardTitle>For Students</CardTitle>
                  <CardDescription>
                    Find your dream job or internship with intelligent matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">• Intelligent job recommendations</p>
                  <p className="text-sm text-gray-600">• Professional CV builder</p>
                  <p className="text-sm text-gray-600">• Application tracking</p>
                  <p className="text-sm text-gray-600">• Skills-based matching</p>
                </CardContent>
              </Card>

              {/* For Employers */}
              <Card className="border-green-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <CardTitle>For Employers</CardTitle>
                  <CardDescription>
                    Find qualified candidates with our matching system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">• Easy job posting</p>
                  <p className="text-sm text-gray-600">• Candidate matching</p>
                  <p className="text-sm text-gray-600">• Application management</p>
                  <p className="text-sm text-gray-600">• Company profiles</p>
                </CardContent>
              </Card>

              {/* Smart Matching */}
              <Card className="border-purple-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <CardTitle>Smart Matching</CardTitle>
                  <CardDescription>
                    AI-powered compatibility scoring for better matches
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">• Percentage compatibility</p>
                  <p className="text-sm text-gray-600">• Skills analysis</p>
                  <p className="text-sm text-gray-600">• Personalized recommendations</p>
                  <p className="text-sm text-gray-600">• Match quality scoring</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                  Join students and employers using PPIS to find success.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary">
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">
          © 2025 PPIS. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
