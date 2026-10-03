import data from '../../content/localized-posts/vi.json'
import batch1 from '../../content/localized-posts/vi-chatgpt-1.json'
import batch2 from '../../content/localized-posts/vi-chatgpt-2.json'
import { createLocalizedGuidesPage } from './createLocalizedGuidesPage'
export default createLocalizedGuidesPage('vi', [...data.guides, ...batch1.guides, ...batch2.guides])
