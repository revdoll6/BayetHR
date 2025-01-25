import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaJson {
    interface Experience {
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string;
    }

    interface Certification {
      name: string;
      issuer: string;
      date: string;
      description: string;
    }

    interface SoftSkill {
      name: string;
      level: 'Basic' | 'Intermediate' | 'Fluent' | 'Expert';
    }

    interface Language {
      name: string;
      level: 'Basic' | 'Intermediate' | 'Fluent' | 'Native';
    }

    type ApplicationExperience = Experience[];
    type ApplicationCertifications = Certification[];
    type ApplicationSoftSkills = SoftSkill[];
    type ApplicationLanguages = Language[];
    type ApplicationCertificates = string[];
  }
}

declare module '@prisma/client' {
  interface PrismaClient {
    education: Prisma.EducationDelegate<DefaultArgs>;
  }

  interface Application {
    id: string;
    status: string;
    candidateId: string;
    jobPositionId: string;
    firstName: string;
    lastName: string;
    mobile: string;
    birthCertificateNumber: string;
    birthDate: Date;
    wilayaId: string;
    communeId: string;
    photo: string | null;
    experience: string;
    certifications: string;
    softSkills: string;
    languages: string;
    profileImage: string | null;
    cv: string | null;
    certificates: string | null;
    createdAt: Date;
    updatedAt: Date;
    jobPosition?: {
      id: string;
      name: string;
      ar_name: string;
    };
    educations?: Education[];
  }

  interface Education {
    id: string;
    type: string;
    level: string;
    institution: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    description: string | null;
    applicationId: string;
    createdAt: Date;
    updatedAt: Date;
  }

  namespace Prisma {
    interface DefaultArgs {
      include?: ApplicationInclude;
    }

    interface ApplicationInclude extends Prisma.ApplicationInclude {
      jobPosition?: boolean;
      educations?: boolean;
      candidate?: {
        select: {
          name: boolean;
          email: boolean;
        };
      };
    }

    interface EducationCreateInput extends Prisma.EducationCreateInput {
      type: string;
      level: string;
      institution: string;
      fieldOfStudy: string;
      startDate: Date | string;
      endDate?: Date | string | null;
      isActive: boolean;
      description?: string | null;
      application?: { connect: { id: string } };
    }

    interface ApplicationCreateInput extends Prisma.ApplicationCreateInput {
      candidate: { connect: { id: string } };
      jobPosition: { connect: { id: string } };
      firstName: string;
      lastName: string;
      mobile: string;
      birthCertificateNumber: string;
      birthDate: Date;
      wilayaId: string;
      communeId: string;
      status: string;
      photo?: string | null;
      experience?: string;
      certifications?: string;
      softSkills?: string;
      languages?: string;
      profileImage?: string | null;
      cv?: string | null;
      certificates?: string | null;
      educations?: { create: EducationCreateInput[] };
    }

    interface ApplicationUpdateInput extends Prisma.ApplicationUpdateInput {
      firstName?: string;
      lastName?: string;
      mobile?: string;
      birthCertificateNumber?: string;
      birthDate?: Date;
      wilayaId?: string;
      communeId?: string;
      status?: string;
      photo?: string | null;
      experience?: string;
      certifications?: string;
      softSkills?: string;
      languages?: string;
      profileImage?: string | null;
      cv?: string | null;
      certificates?: string | null;
      educations?: {
        deleteMany: Record<string, never>;
        create: EducationCreateInput[];
      };
    }

    interface ApplicationSelect extends Prisma.ApplicationSelect {
      id?: boolean;
      status?: boolean;
      candidateId?: boolean;
      jobPositionId?: boolean;
      firstName?: boolean;
      lastName?: boolean;
      mobile?: boolean;
      birthCertificateNumber?: boolean;
      birthDate?: boolean;
      wilayaId?: boolean;
      communeId?: boolean;
      photo?: boolean;
      experience?: boolean;
      certifications?: boolean;
      softSkills?: boolean;
      languages?: boolean;
      profileImage?: boolean;
      cv?: boolean;
      certificates?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      jobPosition?: boolean;
      educations?: boolean;
    }

    interface ApplicationWhereInput extends Prisma.ApplicationWhereInput {
      id?: string;
      candidateId?: string;
      status?: string;
    }

    interface ApplicationOrderByWithRelationInput
      extends Prisma.ApplicationOrderByWithRelationInput {
      createdAt?: 'asc' | 'desc';
    }
  }
}
