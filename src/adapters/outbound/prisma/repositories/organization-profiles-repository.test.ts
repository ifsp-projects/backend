import { beforeEach, expect, it, vi } from 'vitest'

const { findUnique, createPage, createCompletion } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  createPage: vi.fn(),
  createCompletion: vi.fn()
}))

vi.mock('@/adapters/outbound/prisma/prisma', () => ({
  prisma: {
    organizationProfile: { findUnique },
    page: { create: createPage }
  }
}))

vi.mock('@/shared/infra/openai', () => ({
  openai: { chat: { completions: { create: createCompletion } } }
}))

import { OrganizationsProfilesRepository } from './organization-profiles-repository'

beforeEach(() => {
  vi.clearAllMocks()
  findUnique.mockImplementation(({ where }: { where: { slug: string } }) => {
    const profiles: Record<string, { slug: string; ong_id: string }> = {
      'ong-um': { slug: 'ong-um', ong_id: 'organization-1' },
      'ong-dois': { slug: 'ong-dois', ong_id: 'organization-2' }
    }

    return profiles[where.slug] ?? null
  })
})

it('returns exact ownership for each of two organizations', async () => {
  const repository = new OrganizationsProfilesRepository()

  expect(await repository.getOrganizationOwnershipBySlug('ong-um')).toEqual({
    slug: 'ong-um',
    ong_id: 'organization-1'
  })
  expect(await repository.getOrganizationOwnershipBySlug('ong-dois')).toEqual({
    slug: 'ong-dois',
    ong_id: 'organization-2'
  })
  expect(findUnique).toHaveBeenCalledWith({
    where: { slug: 'ong-um' },
    select: { slug: true, ong_id: true }
  })
  expect(findUnique).toHaveBeenCalledWith({
    where: { slug: 'ong-dois' },
    select: { slug: true, ong_id: true }
  })
  expect(createPage).not.toHaveBeenCalled()
  expect(createCompletion).not.toHaveBeenCalled()
})

it('distinguishes an unknown slug from a profile owned by another organization', async () => {
  const repository = new OrganizationsProfilesRepository()

  expect(await repository.getOrganizationOwnershipBySlug('missing')).toBeNull()
  expect(await repository.getOrganizationOwnershipBySlug('ong-dois')).toEqual({
    slug: 'ong-dois',
    ong_id: 'organization-2'
  })
  expect(createPage).not.toHaveBeenCalled()
  expect(createCompletion).not.toHaveBeenCalled()
})
