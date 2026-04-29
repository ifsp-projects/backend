import fs from 'node:fs'
import path from 'node:path'
import { Prisma } from '@prisma-generated'
import { PagesInterface } from '../../../../core/domain/ports/repositories/pages-repository'
import { prisma } from '@/adapters/outbound/prisma/prisma'
import { PAGE_TEMPLATES } from '@/shared/constants/default-templates-copies'
import { openai } from '@/shared/infra/openai'
import { PAGE_TEMPLATES_ORDER } from '@/shared/constants/default-templates-order'

export class PagesRepository implements PagesInterface {
  getPageBySlug = async (slug: string) => {
    const organization = await prisma.organizationProfile.findFirst({
      where: {
        slug
      }
    })

    if (!organization) {
      return null
    }

    const page = await prisma.page.findFirst({
      where: {
        organization_id: organization?.ong_id
      }
    })

    if (page) {
      return page
    }

    const file_path = path.join(
      process.cwd(),
      'src/shared/constants/prompts/copy-generator.md'
    )
    const prompt_template = fs.readFileSync(file_path, 'utf8')

    const system_prompt = prompt_template
      .replace('{{ORG_NAME}}', organization?.name || '')
      .replace('{{ORG_DESCRIPTION}}', organization?.ong_description || '')

    const base_template = PAGE_TEMPLATES['primary']

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

    let personalized_page_template =
      response?.choices[0]?.message?.content || base_template

    try {
      const raw = response?.choices[0]?.message?.content
      if (raw) {
        personalized_page_template = JSON.parse(raw)
      }
    } catch (err) {
      console.error('JSON parse failed:', err)
    }

    return await prisma.page.create({
      data: {
        organization_id: organization?.ong_id,
        sections: personalized_page_template,
        order: PAGE_TEMPLATES_ORDER['primary']
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
