# PPIS - Platformë për Punësim dhe Internship për Studentët

A modern Student Employment and Internship Platform built with Next.js, TypeScript, and Tailwind CSS. This application connects students with employers for job opportunities and internships, featuring intelligent matching and comprehensive application management.

## 🚀 Features

- **Student & Employer Profiles**: Comprehensive profiles with detailed information
- **Job & Internship Posting**: Easy creation and management of opportunities
- **Intelligent Matching System**: CV-based matching with percentage compatibility
- **Application Management**: Track applications, status updates, and communications
- **CV Builder**: Uniform CV format for easy comparison and matching
- **User Authentication**: Secure separate portals for students and employers
- **File Upload**: Support for CV and document uploads
- **Responsive Design**: Modern, mobile-first design with Tailwind CSS

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript
- **Styling**: Tailwind CSS with responsive design
- **Database**: SQLite with Prisma ORM (development), PostgreSQL (production)
- **Authentication**: NextAuth.js with role-based access
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **File Storage**: Local file system (development), cloud storage (production)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ppis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── student/       # Student dashboard
│   │   └── employer/      # Employer dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions
    ├── auth.ts           # Authentication utilities
    ├── matching.ts       # Matching algorithm
    ├── prisma.ts         # Prisma client
    └── utils.ts          # General utilities
```

## 🎯 Key Features Explained

### Intelligent Matching System
The platform uses a sophisticated algorithm to match students with job opportunities based on:
- Skills compatibility
- Experience level
- Education background
- Location preferences
- Job requirements

### CV Builder
- Standardized CV format
- Easy comparison between candidates
- Automatic skill extraction
- Export capabilities

### Application Management
- Real-time application tracking
- Status updates and notifications
- Communication tools
- Interview scheduling

## 🚀 Getting Started

### For Students
1. Create a student account
2. Complete your profile with education and experience
3. Upload your CV or use the CV builder
4. Browse job opportunities
5. Apply with personalized cover letters

### For Employers
1. Create an employer account
2. Set up your company profile
3. Post job opportunities and internships
4. Review matched candidates
5. Manage applications and communications

## 📊 Database Schema

The application uses Prisma ORM with the following main models:
- Users (Student/Employer/Admin roles)
- StudentProfiles & EmployerProfiles
- Jobs & Internships
- Applications & MatchingScores
- Skills & CV management

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma db push` - Push schema changes to database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
