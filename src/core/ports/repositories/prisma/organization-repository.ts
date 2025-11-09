import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { OrganizationInterface } from '../interfaces/organization-interface'
import { prisma } from '@/adapters/outbound/prisma/prisma'

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
        organization_profile: true
      }
    })
  }

  getAllOrganizations = async () => {
    return await prisma.organization.findMany({
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
}
