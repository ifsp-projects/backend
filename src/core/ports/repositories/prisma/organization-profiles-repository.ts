import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { prisma } from '@/adapters/outbound/prisma/prisma'

export class OrganizationsProfilesRepository
  implements OrganizationsProfilesRepository
{
  createOrganizationProfile = async ({
    id = randomUUID(),
    ...payload
  }: Prisma.OrganizationProfileUncheckedCreateInput) => {
    return await prisma.organizationProfile.create({
      data: {
        id,
        ...payload
      }
    })
  }

  updateOrganizationProfile = async (
    id: string,
    { email: _, ...payload }: Prisma.OrganizationUncheckedUpdateInput
  ) => {
    return await prisma.organizationProfile.update({
      where: {
        id
      },
      data: {
        ...payload
      }
    })
  }

  getOrganizationProfileById = async (id: string) => {
    return await prisma.organizationProfile.findUnique({
      where: {
        id
      }
    })
  }

  getOrganizationProfileBySlug = async (slug: string) => {
    return await prisma.organizationProfile.findUnique({
      where: {
        slug
      }
    })
  }

  getAllOrganizationsProfiles = async () => {
    return await prisma.organizationProfile.findMany()
  }

  deleteOrganizationProfile = async (id: string) => {
    return await prisma.organizationProfile.delete({
      where: {
        id
      }
    })
  }
}
