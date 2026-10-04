export type GuideArt = 'documents' | 'print' | 'conversion' | 'scan' | 'privacy' | 'qr'

const ART_FILES: Record<GuideArt, string> = {
  documents: 'document-guide-cover.jpg',
  print: 'web-to-print-cover.jpg',
  conversion: 'file-conversion-cover.jpg',
  scan: 'scan-ocr-cover.jpg',
  privacy: 'document-privacy-cover.jpg',
  qr: 'qr-print-cover.jpg',
}

const COVER_IMAGES = Object.fromEntries(Object.entries(ART_FILES).map(([art, file]) => [art, `${import.meta.env.BASE_URL}images/guides/${file}`])) as Record<GuideArt, string>

const COVER_ALT: Record<GuideArt, Record<string, string>> = {
  documents: {
    en: 'Blank pages, a blue document folder and a pen', es: 'Hojas en blanco, una carpeta azul y un bolígrafo', 'pt-BR': 'Folhas em branco, uma pasta azul e uma caneta',
    hi: 'खाली पन्ने, नीला दस्तावेज़ फ़ोल्डर और एक पेन', ar: 'أوراق فارغة ومجلد أزرق وقلم', bn: 'সাদা কাগজ, নীল ডকুমেন্ট ফোল্ডার ও একটি কলম', vi: 'Giấy trắng, bìa hồ sơ xanh và một cây bút', 'zh-CN': '空白纸张、蓝色文件夹和一支笔',
  },
  print: {
    en: 'A web page being prepared for clean printing', es: 'Una página web preparada para imprimirse sin elementos sobrantes', 'pt-BR': 'Uma página da web sendo preparada para impressão limpa',
    hi: 'एक वेब पेज को साफ़ प्रिंट के लिए तैयार किया जा रहा है', ar: 'صفحة ويب يجري إعدادها للطباعة بشكل واضح', bn: 'একটি ওয়েব পেজ পরিষ্কারভাবে প্রিন্টের জন্য প্রস্তুত হচ্ছে', vi: 'Trang web đang được chuẩn bị để in gọn gàng', 'zh-CN': '正在准备整洁打印的网页',
  },
  conversion: {
    en: 'An image and documents being converted into a file', es: 'Una imagen y varios documentos convertidos en un archivo', 'pt-BR': 'Uma imagem e documentos sendo convertidos em um arquivo',
    hi: 'एक चित्र और दस्तावेज़ों को एक फ़ाइल में बदला जा रहा है', ar: 'تحويل صورة ومستندات إلى ملف واحد', bn: 'একটি ছবি ও ডকুমেন্ট এক ফাইলে রূপান্তর হচ্ছে', vi: 'Hình ảnh và tài liệu đang được chuyển thành một tệp', 'zh-CN': '图片和文档正在转换为一个文件',
  },
  scan: {
    en: 'A paper document being scanned and inspected', es: 'Un documento en papel que se está escaneando y revisando', 'pt-BR': 'Um documento em papel sendo digitalizado e analisado',
    hi: 'कागज़ी दस्तावेज़ को स्कैन और जाँचा जा रहा है', ar: 'مسح مستند ورقي ضوئيًا وفحصه', bn: 'কাগজের ডকুমেন্ট স্ক্যান করে পরীক্ষা করা হচ্ছে', vi: 'Tài liệu giấy đang được quét và kiểm tra', 'zh-CN': '纸质文档正在扫描和检查',
  },
  privacy: {
    en: 'A private document protected by a blue padlock', es: 'Un documento privado protegido con un candado azul', 'pt-BR': 'Um documento privado protegido por um cadeado azul',
    hi: 'नीले ताले से सुरक्षित एक निजी दस्तावेज़', ar: 'مستند خاص محمي بقفل أزرق', bn: 'নীল তালা দিয়ে সুরক্ষিত একটি ব্যক্তিগত ডকুমেন্ট', vi: 'Tài liệu riêng tư được bảo vệ bằng ổ khóa xanh', 'zh-CN': '由蓝色挂锁保护的私人文档',
  },
  qr: {
    en: 'A printed QR code being scanned by a phone', es: 'Un código QR impreso que se escanea con un teléfono', 'pt-BR': 'Um código QR impresso sendo lido por um celular',
    hi: 'फोन से स्कैन किया जा रहा प्रिंट किया हुआ QR कोड', ar: 'رمز QR مطبوع يجري مسحه بهاتف', bn: 'ফোন দিয়ে স্ক্যান করা একটি প্রিন্ট করা QR কোড', vi: 'Mã QR được in và quét bằng điện thoại', 'zh-CN': '正在被手机扫描的印刷二维码',
  },
}

const toolGroups: Record<GuideArt, string[]> = {
  documents: ['edit-pdf', 'pdf-forms', 'pdf-reader', 'sign-pdf', 'merge-pdf', 'split-pdf', 'organize-pdf', 'rotate-pdf', 'delete-pages', 'extract-pages', 'crop-pdf', 'page-numbers', 'add-watermark', 'compare-pdf', 'repair-pdf'],
  print: ['html-to-pdf', 'website-to-pdf'],
  conversion: ['image-converter', 'jpg-to-pdf', 'pdf-to-jpg', 'pdf-to-word', 'word-to-pdf', 'pdf-to-excel', 'excel-to-pdf', 'pdf-to-ppt', 'ppt-to-pdf', 'ebook-converter', 'epub-to-pdf', 'mobi-to-pdf', 'create-zip', 'extract-zip', 'pdf-to-pdfa', 'compress-pdf', 'compress-image', 'pdf-to-markdown', 'pdf-to-text'],
  scan: ['ocr-pdf', 'scan-to-pdf'],
  privacy: ['redact-pdf', 'protect-pdf', 'unlock-pdf', 'remove-metadata'],
  qr: ['qr-code'],
}

const clusterGroups: Record<GuideArt, string[]> = {
  documents: ['merge', 'split', 'edit', 'sign', 'watermark-page-numbers'],
  print: ['print', 'save-pdf', 'recipes', 'students', 'publishers', 'save-ink', 'extensions'],
  conversion: ['from-pdf', 'to-pdf', 'images', 'files', 'archive', 'slides', 'ebooks', 'compress'],
  scan: ['ocr'],
  privacy: ['privacy'],
  qr: ['qr'],
}

export const guideToolArt = (tool = ''): GuideArt => Object.entries(toolGroups).find(([, tools]) => tools.includes(tool))?.[0] as GuideArt || 'documents'
export const guideClusterArt = (cluster = ''): GuideArt => Object.entries(clusterGroups).find(([, clusters]) => clusters.includes(cluster))?.[0] as GuideArt || 'documents'
export const guideCoverUrl = (art: GuideArt = 'documents') => COVER_IMAGES[art]
export const guideCoverAlt = (locale = 'en', art: GuideArt = 'documents') => COVER_ALT[art][locale] || COVER_ALT[art].en

export function GuideCover({ locale = 'en', compact = false, art = 'documents' }: { locale?: string; compact?: boolean; art?: GuideArt }) {
  return (
    <figure className={`guide-cover${compact ? ' guide-cover-compact' : ''}`}>
      <img src={guideCoverUrl(art)} alt={guideCoverAlt(locale, art)} width="1200" height="800" loading="lazy" decoding="async" />
    </figure>
  )
}
