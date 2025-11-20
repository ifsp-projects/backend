import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { prisma } from '@/adapters/outbound/prisma/prisma'
import { PAGE_TEMPLATES } from '@/shared/constants/default-templates-copies'

export class OrganizationsProfilesRepository
  implements OrganizationsProfilesRepository
{
  createOrganizationProfile = async ({
    id = randomUUID(),
    ...payload
  }: Prisma.OrganizationProfileUncheckedCreateInput & {
    design_template: 'primary' | 'secondary' | 'tertiary' | 'quartenary'
  }) => {
    await prisma.organization.update({
      where: {
        id: payload.ong_id
      },
      data: {
        is_user_new: false
      }
    })

    await prisma.page.create({
      data: {
        organization_id: payload.ong_id,
        sections: PAGE_TEMPLATES[payload.design_template]
      }
    })

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
