# PPIS - Platformë për Punësim dhe Internship për Studentët

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Student Employment and Internship Platform (PPIS) built with Next.js, TypeScript, and Tailwind CSS. The application connects students with employers for job opportunities and internships, featuring intelligent matching and application management.

## Key Features
- **Student Profiles**: Comprehensive profiles with skills, education, and experience
- **Employer Profiles**: Company profiles with job posting capabilities
- **Job & Internship Posting**: Easy job/internship creation and management
- **Intelligent Matching System**: CV-based matching with percentage compatibility
- **Application Management**: Track applications, status updates, and communications
- **CV Builder**: Uniform CV format for easy comparison and matching
- **User Authentication**: Secure separate portals for students and employers

## Technology Stack
- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript
- **Styling**: Tailwind CSS with responsive design
- **Database**: SQLite with Prisma ORM (development), PostgreSQL (production)
- **Authentication**: NextAuth.js with role-based access (Student/Employer)
- **File Storage**: Local file system (development), cloud storage for CV/documents (production)
- **State Management**: React hooks and Context API
- **Form Handling**: React Hook Form with Zod validation
- **Matching Algorithm**: Custom scoring algorithm for CV-job compatibility

## Code Style Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling with semantic class names
- Implement proper error handling and loading states
- Use server components where possible for better performance
- Follow accessibility best practices (WCAG 2.1)
- Write descriptive component and function names
- Use proper JSDoc comments for complex functions

## Database Schema
- **Users**: User accounts with role-based access (Student/Employer)
- **StudentProfiles**: Student information, education, skills, experience
- **EmployerProfiles**: Company information, description, contact details
- **Jobs**: Job postings with requirements and descriptions
- **Internships**: Internship opportunities with specific criteria
- **Applications**: Student applications to jobs/internships
- **CVs**: Standardized CV format for matching algorithm
- **Skills**: Skill taxonomy for matching and filtering
- **MatchingScores**: Compatibility scores between students and opportunities

## Component Structure
- Keep components small and focused on single responsibility
- Use proper prop typing with TypeScript interfaces
- Implement loading and error states for all async operations
- Follow consistent naming conventions (PascalCase for components)
- Create reusable UI components in the components/ui directory
