import { Prisma } from '@prisma-generated'
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
    design_template: 'primary' | 'secondary' | 'tertiary' | 'quarternary'
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
    payload: Prisma.OrganizationProfileUpdateInput,
    pageId?: string
  ) => {
    if (payload.design_template) {
      console.log(`page ID: ${pageId}`)

      const template = typeof payload.design_template === 'string'
        ? payload.design_template
        : payload.design_template.set
    
      if (template) {
        await prisma.page.update({
          where: {
            id: pageId
          },
          data: {
            sections: PAGE_TEMPLATES[template as keyof typeof PAGE_TEMPLATES]
          }
        })
      }
    }

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
      },
      include: {
        addresses: true
      }
    })
  }

  getOrganizationProfileBySlug = async (slug: string) => {
    return await prisma.organizationProfile.findUnique({
      where: {
        slug
      },
      include: {
        addresses: true
      }
    })
  }

  getAllOrganizationsProfiles = async () => {
    return await prisma.organizationProfile.findMany({
      include: {
        addresses: true
      }
    })
  }

  deleteOrganizationProfile = async (id: string) => {
    return await prisma.organizationProfile.delete({
      where: {
        id
      }
    })
  }
}
