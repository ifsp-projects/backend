import { Page, Prisma } from '@prisma/client'
import { PagesInterface } from '../interfaces/pages-repository'
import { prisma } from '@/adapters/outbound/prisma/prisma'

export class PagesRepository implements PagesInterface {
  getPageBySlug = async (slug: string) => {
    const organization = await prisma.organizationProfile.findFirst({
      where: {
        slug
      }
    })

    return await prisma.page.findFirst({
      where: {
        organization_id: organization?.ong_id
      }
    })
  }

  getPageById = async (id: string) => {
    return await prisma.page.findFirst({
      where: {
        id
      }
    })
  }

  updatePage = async (id: string, payload: Prisma.PageUncheckedUpdateInput) => {
    return await prisma.page.update({
      where: {
        id
      },
      data: {
        ...payload
      }
    })
  }
}
