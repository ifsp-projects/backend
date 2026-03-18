import { z } from 'zod'

const ongCategoryEnum = z.enum([
    'animais',
    'meioAmbiente',
    'educacao',
    'saude',
    'direitosHumanos',
    'combateAFome',
    'criancasEAdolescentes',
    'idosos',
    'pessoasComDeficiencia',
    'moradoresDeRua',
    'igualdadeDeGenero',
    'refugiadosEImigrantes',
    'protecaoAnimal',
    'desenvolvimentoComunitario',
    'culturaEArte',
    'esporteEInclusao',
    'voluntariadoEDoacoes',
    'tecnologiaSocial',
    'direitosDasMulheres',
    'outros'
])

export const getAllOrganizationsQuerySchema = z.object({
    name: z.string().optional(),
    ong_type: ongCategoryEnum.optional()
})
