import { Prisma, Address } from '@prisma/client'
import { AddressInterface } from '../interfaces/addresses-repository'
import { randomUUID } from 'crypto'
import { prisma } from '@/adapters/outbound/prisma/prisma'

export class AddressesRepository implements AddressInterface {
  createAddress = async ({
    id = randomUUID(),
    ...payload
  }: Prisma.AddressUncheckedCreateInput) => {
    return await prisma.address.create({
      data: {
        id,
        ...payload
      }
    })
  }

  getAddressById = async (id: string) => {
    return await prisma.address.findFirst({
      where: {
        id
      }
    })
  }

  getAllAddresses = async () => {
    return await prisma.address.findMany()
  }

  updateAddress = async (
    id: string,
    payload: Prisma.AddressUncheckedUpdateInput
  ) => {
    return await prisma.address.update({
      where: {
        id: id
      },
      data: {
        ...payload
      }
    })
  }

  deleteAddress = async (id: string) => {
    return await prisma.address.delete({
      where: {
        id
      }
    })
  }
}
