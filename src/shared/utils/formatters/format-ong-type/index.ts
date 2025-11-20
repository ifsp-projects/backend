import { OngCategory } from '@prisma/client'

export const HUBSPOT_ONG_VALUES: string[] = [
  'Animais',
  'Meio Ambiente',
  'Educação',
  'Saúde',
  'Direitos Humanos',
  'Combate à Fome',
  'Crianças e Adolescentes',
  'Idosos',
  'Pessoas com Deficiência',
  'Moradores de Rua',
  'Igualdade de Gênero',
  'Refugiados e Imigrantes',
  'Proteção Animal',
  'Desenvolvimento Comunitário',
  'Cultura e Arte',
  'Esporte e Inclusão',
  'Voluntariado e Doações',
  'Tecnologia Social',
  'Direitos das Mulheres',
  'Outros'
] as const

export type HubspotOngValue = (typeof HUBSPOT_ONG_VALUES)[number]

export const isHubspotOngValue = (value: unknown): value is HubspotOngValue => {
  return (
    typeof value === 'string' &&
    HUBSPOT_ONG_VALUES.includes(value as HubspotOngValue)
  )
}

export const HUBSPOT_ONG_VALUES_SET = new Set(HUBSPOT_ONG_VALUES)

export const HubspotOngValueEnum = HUBSPOT_ONG_VALUES.reduce(
  (acc, value) => {
    acc[value] = value
    return acc
  },
  {} as Record<HubspotOngValue, HubspotOngValue>
)

export const HUBSPOT_TO_PRISMA_ONG_CATEGORY: Record<
  HubspotOngValue,
  OngCategory
> = {
  Animais: OngCategory.animais,
  'Meio Ambiente': OngCategory.meioAmbiente,
  Educação: OngCategory.educacao,
  Saúde: OngCategory.saude,
  'Direitos Humanos': OngCategory.direitosHumanos,
  'Combate à Fome': OngCategory.combateAFome,
  'Crianças e Adolescentes': OngCategory.criancasEAdolescentes,
  Idosos: OngCategory.idosos,
  'Pessoas com Deficiência': OngCategory.pessoasComDeficiencia,
  'Moradores de Rua': OngCategory.moradoresDeRua,
  'Igualdade de Gênero': OngCategory.igualdadeDeGenero,
  'Refugiados e Imigrantes': OngCategory.refugiadosEImigrantes,
  'Proteção Animal': OngCategory.protecaoAnimal,
  'Desenvolvimento Comunitário': OngCategory.desenvolvimentoComunitario,
  'Cultura e Arte': OngCategory.culturaEArte,
  'Esporte e Inclusão': OngCategory.esporteEInclusao,
  'Voluntariado e Doações': OngCategory.voluntariadoEDoacoes,
  'Tecnologia Social': OngCategory.tecnologiaSocial,
  'Direitos das Mulheres': OngCategory.direitosDasMulheres,
  Outros: OngCategory.outros
}

export const PRISMA_TO_HUBSPOT_ONG_CATEGORY: Record<
  OngCategory,
  HubspotOngValue
> = {
  [OngCategory.animais]: 'Animais',
  [OngCategory.meioAmbiente]: 'Meio Ambiente',
  [OngCategory.educacao]: 'Educação',
  [OngCategory.saude]: 'Saúde',
  [OngCategory.direitosHumanos]: 'Direitos Humanos',
  [OngCategory.combateAFome]: 'Combate à Fome',
  [OngCategory.criancasEAdolescentes]: 'Crianças e Adolescentes',
  [OngCategory.idosos]: 'Idosos',
  [OngCategory.pessoasComDeficiencia]: 'Pessoas com Deficiência',
  [OngCategory.moradoresDeRua]: 'Moradores de Rua',
  [OngCategory.igualdadeDeGenero]: 'Igualdade de Gênero',
  [OngCategory.refugiadosEImigrantes]: 'Refugiados e Imigrantes',
  [OngCategory.protecaoAnimal]: 'Proteção Animal',
  [OngCategory.desenvolvimentoComunitario]: 'Desenvolvimento Comunitário',
  [OngCategory.culturaEArte]: 'Cultura e Arte',
  [OngCategory.esporteEInclusao]: 'Esporte e Inclusão',
  [OngCategory.voluntariadoEDoacoes]: 'Voluntariado e Doações',
  [OngCategory.tecnologiaSocial]: 'Tecnologia Social',
  [OngCategory.direitosDasMulheres]: 'Direitos das Mulheres',
  [OngCategory.outros]: 'Outros'
}

export const toPrismaOngCategory = (value: string): OngCategory | undefined => {
  if (!isHubspotOngValue(value)) return undefined
  return HUBSPOT_TO_PRISMA_ONG_CATEGORY[value]
}

export const toHubspotOngValue = (value: OngCategory): HubspotOngValue => {
  return PRISMA_TO_HUBSPOT_ONG_CATEGORY[value]
}
