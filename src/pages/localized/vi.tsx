import { LANGUAGE_PACKS } from '../../content/localizedGuidesFull'
import { createLocalizedGuidesPage } from './createLocalizedGuidesPage'
const pack = LANGUAGE_PACKS.find((item) => item.locale === 'vi')
export default createLocalizedGuidesPage('vi', pack?.guides || [])
