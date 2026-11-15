import rolling51 from '../../content/localized-posts/rolling-51.json'
import data from '../../content/localized-posts/pt-BR.json'
import { createLocalizedGuidesPage } from './createLocalizedGuidesPage'
const PortugueseGuidesPage = createLocalizedGuidesPage('pt-BR', [...data.guides, ...rolling51.find((entry) => entry.locale === 'pt-BR')!.guides])
export default PortugueseGuidesPage
