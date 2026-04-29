import fs from 'node:fs'
import path from 'node:path'
import { Prisma } from '@prisma-generated'
import { randomUUID } from 'crypto'
import { prisma } from '@/adapters/outbound/prisma/prisma'
import { PAGE_TEMPLATES } from '@/shared/constants/default-templates-copies'
import { openai } from '@/shared/infra/openai'

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

    const file_path = path.join(
      process.cwd(),
      'src/shared/constants/prompts/copy-generator.md'
    )
    const prompt_template = fs.readFileSync(file_path, 'utf8')

    const system_prompt = prompt_template
      .replace('{{ORG_NAME}}', payload.name as string)
      .replace('{{ORG_DESCRIPTION}}', payload.ong_description as string)

    const base_template =
      PAGE_TEMPLATES[payload.design_template as keyof typeof PAGE_TEMPLATES]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system_prompt },
        {
          role: 'user',
          content: `Template structure to follow: ${JSON.stringify(
            base_template
          )}`
        }
      ],
      response_format: { type: 'json_object' }
    })

    const personalized_page_template =
      response?.choices[0]?.message?.content || base_template

    await prisma.page.create({
      data: {
        organization_id: payload.ong_id,
        sections: personalized_page_template
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
      const template =
        typeof payload.design_template === 'string'
          ? payload.design_template
          : payload.design_template.set

      if (template && pageId) {
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

    console.log(JSON.stringify(payload))

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
