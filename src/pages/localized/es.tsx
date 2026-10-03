import { LANGUAGE_PACKS } from '../../content/localizedGuidesFull'
import { createLocalizedGuidesPage } from './createLocalizedGuidesPage'
const pack = LANGUAGE_PACKS.find((item) => item.locale === 'es')
export default createLocalizedGuidesPage('es', pack?.guides || [])
