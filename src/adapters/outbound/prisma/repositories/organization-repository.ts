import { randomUUID } from 'crypto'

import { prisma } from '@/adapters/outbound/prisma/prisma'
import type { OngCategoryEnum, Prisma } from '@prisma-generated'

import type { OrganizationInterface } from '../../../../core/domain/ports/interfaces/organization-interface'

export class OrganizationsRepository implements OrganizationInterface {
  createOrganization = async ({
    id = randomUUID(),
    ...payload
  }: Prisma.OrganizationUncheckedCreateInput) => {
    return await prisma.organization.create({
      data: {
        id,
        ...payload
      },
      include: {
        organization_profile: true
      }
    })
  }

  updateOrganization = async (
    id: string,
    { email: _, ...payload }: Prisma.OrganizationUncheckedUpdateInput
  ) => {
    return await prisma.organization.update({
      where: {
        id
      },
      data: {
        ...payload
      },
      include: {
        organization_profile: true
      }
    })
  }

  getOrganizationById = async (id: string) => {
    return await prisma.organization.findUnique({
      where: {
        id
      },
      include: {
        organization_profile: true
      }
    })
  }

  getOrganizationByEmail = async (email: string) => {
    return await prisma.organization.findUnique({
      where: {
        email
      },
      include: {
        organization_profile: {
          include: {
            addresses: true
          }
        }
      }
    })
  }

  getAllOrganizations = async (filters?: {
    name?: string
    ong_type?: OngCategoryEnum
  }) => {
    return await prisma.organization.findMany({
      where: {
        organization_profile: {
          ...(filters?.name && {
            name: { contains: filters.name, mode: 'insensitive' }
          }),
          ...(filters?.ong_type && { ong_type: filters.ong_type })
        }
      },
      include: {
        organization_profile: true
      }
    })
  }

  deleteOrganization = async (id: string) => {
    return await prisma.organization.delete({
      where: {
        id
      }
    })
  }

  getOrganizationBySlug = async (slug: string) => {
    const organizationProfile = await prisma.organizationProfile.findFirst({
      where: {
        slug
      }
    })

    return await prisma.organization.findFirst({
      where: {
        id: organizationProfile?.ong_id
      },
      include: {
        organization_profile: true
      }
    })
  }
}
