import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'EMPLOYER']),
  // Student fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  yearOfStudy: z.number().optional(),
  // Employer fields
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const { email, password, role, ...profileData } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      // Create profile based on role
      if (role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            phone: profileData.phone || '',
            university: profileData.university || '',
            major: profileData.major || '',
            yearOfStudy: profileData.yearOfStudy || 1,
          },
        });
      } else if (role === 'EMPLOYER') {
        await tx.employerProfile.create({
          data: {
            userId: user.id,
            companyName: profileData.companyName || '',
            industry: profileData.industry || '',
            companySize: profileData.companySize || '',
            website: profileData.website || '',
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: result.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
