import data from '../../content/localized-posts/hi.json'
import batch1 from '../../content/localized-posts/hi-chatgpt-1.json'
import batch2 from '../../content/localized-posts/hi-chatgpt-2.json'
import batch3 from '../../content/localized-posts/hi-chatgpt-3.json'
import batch4 from '../../content/localized-posts/hi-chatgpt-4.json'
import batch5 from '../../content/localized-posts/hi-chatgpt-5.json'
import batch6 from '../../content/localized-posts/hi-chatgpt-6.json'
import batch7 from '../../content/localized-posts/hi-chatgpt-7.json'
import batch8 from '../../content/localized-posts/hi-chatgpt-8.json'
import { createLocalizedGuidesPage } from './createLocalizedGuidesPage'
const HindiGuidesPage = createLocalizedGuidesPage('hi', [...data.guides, ...batch1.guides, ...batch2.guides, ...batch3.guides, ...batch4.guides, ...batch5.guides, ...batch6.guides, ...batch7.guides, ...batch8.guides])
export default HindiGuidesPage
