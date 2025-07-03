"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Briefcase, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [userType, setUserType] = useState<"student" | "employer">("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Student fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [university, setUniversity] = useState("")
  const [major, setMajor] = useState("")
  const [year, setYear] = useState("")
  
  // Employer fields
  const [companyName, setCompanyName] = useState("")
  const [description, setDescription] = useState("")
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useState(() => {
    const type = searchParams.get("type")
    if (type === "employer" || type === "student") {
      setUserType(type)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Fjalëkalimet nuk përputhen")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Fjalëkalimi duhet të jetë të paktën 6 karaktere")
      setIsLoading(false)
      return
    }

    try {
      const userData = {
        email,
        password,
        role: userType.toUpperCase(),
        ...(userType === "student" 
          ? { firstName, lastName, university, major, year: year ? parseInt(year) : null }
          : { companyName, description, industry, location }
        )
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        router.push("/auth/login?message=Regjistrimi u krye me sukses")
      } else {
        const data = await response.json()
        setError(data.error || "Ka ndodhur një gabim gjatë regjistrimit")
      }
    } catch (error) {
      setError("Ka ndodhur një gabim. Provoni përsëri.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Briefcase className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Regjistrohuni në PPIS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Krijoni llogarinë tuaj dhe filloni të eksploroni mundësitë
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUserType("student")}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
              userType === "student"
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            👨‍🎓 Student
          </button>
          <button
            type="button"
            onClick={() => setUserType("employer")}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
              userType === "employer"
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            🏢 Punëdhënës
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="Shkruani email-in tuaj"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Fjalëkalimi
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 karaktere"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmoni fjalëkalimin
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                placeholder="Shkruani përsëri fjalëkalimin"
              />
            </div>

            {/* Student-specific fields */}
            {userType === "student" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Emri
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1"
                      placeholder="Emri juaj"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Mbiemri
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1"
                      placeholder="Mbiemri juaj"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                    Universiteti
                  </label>
                  <Input
                    id="university"
                    name="university"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="mt-1"
                    placeholder="Emri i universitetit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                      Dega
                    </label>
                    <Input
                      id="major"
                      name="major"
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="mt-1"
                      placeholder="p.sh. Informatikë"
                    />
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      Viti
                    </label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      min="1"
                      max="6"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="mt-1"
                      placeholder="1-6"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Employer-specific fields */}
            {userType === "employer" && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Emri i kompanisë
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1"
                    placeholder="Emri i kompanisë suaj"
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industria
                  </label>
                  <Input
                    id="industry"
                    name="industry"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="mt-1"
                    placeholder="p.sh. Teknologji, Financa"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Lokacioni
                  </label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1"
                    placeholder="Qyteti, Shteti"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Përshkrimi i kompanisë
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    placeholder="Përmbledhe e shkurtër e kompanisë suaj"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Duke u regjistruar..." : "Regjistrohuni"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Keni tashmë llogari?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Kyçuni këtu
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
