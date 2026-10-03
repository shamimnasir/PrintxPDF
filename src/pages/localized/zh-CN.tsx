import { LANGUAGE_PACKS } from '../../content/localizedGuidesFull'
import { createLocalizedGuidesPage } from './createLocalizedGuidesPage'
const pack = LANGUAGE_PACKS.find((item) => item.locale === 'zh-CN')
export default createLocalizedGuidesPage('zh-CN', pack?.guides || [])
