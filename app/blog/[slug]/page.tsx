import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Article data
const articles: Record<string, {
  title: string
  excerpt: string
  category: string
  readTime: string
  image: string
  date: string
  content: string[]
}> = {
  'how-to-choose-grinding-wheel': {
    title: 'How to Choose the Right Grinding Wheel',
    excerpt: 'A comprehensive guide to selecting grinding wheels based on material, application, and finish requirements.',
    category: 'Guides',
    readTime: '5 min read',
    image: '/slide-1.png',
    date: 'February 15, 2025',
    content: [
      'Selecting the right grinding wheel is crucial for achieving optimal performance, surface finish, and tool life. This guide will help you understand the key factors to consider when choosing a grinding wheel for your application.',
      '## Understanding Grinding Wheel Specifications',
      'Grinding wheels are specified by several key characteristics: abrasive type, grain size, bond type, wheel structure, and grade. Each of these factors affects how the wheel performs on different materials and applications.',
      '## Abrasive Types',
      '**Aluminum Oxide (Al2O3):** The most common abrasive, ideal for grinding ferrous metals like steel and iron. It\'s tough and fracture-resistant, making it suitable for high-speed grinding.',
      '**Zirconia Alumina:** Excellent for heavy stock removal on steel and stainless steel. Self-sharpening properties provide consistent cutting action and longer wheel life.',
      '**Ceramic:** Premium abrasive with exceptional hardness and friability. Ideal for precision grinding on hardened steels and exotic alloys. Provides cooler cutting and superior surface finish.',
      '**Silicon Carbide:** Best for non-ferrous metals, stone, and glass. Sharper and more friable than aluminum oxide, but less durable on steel.',
      '## Grain Size Selection',
      'Grain size determines the surface finish and material removal rate:',
      '- **Coarse (16-36 grit):** Rapid stock removal, rough finish',
      '- **Medium (46-80 grit):** General purpose grinding',
      '- **Fine (100-180 grit):** Precision grinding, smoother finish',
      '- **Very Fine (220+ grit):** Polishing, mirror finish',
      '## Bond Type Considerations',
      'The bond holds the abrasive grains together and affects wheel performance:',
      '- **Vitrified:** Most common, provides rigid grinding action',
      '- **Resinoid:** More flexible, cooler cutting, ideal for heavy grinding',
      '- **Rubber:** Very flexible, provides fine finish',
      '## Application Guidelines',
      'Match your grinding wheel to your specific application:',
      '1. **Material being ground:** Choose abrasive type accordingly',
      '2. **Amount of stock removal:** Determines grain size',
      '3. **Surface finish required:** Finer grits for better finish',
      '4. **Machine power and speed:** Higher power allows harder wheels',
      '5. **Wet or dry grinding:** Some wheels are optimized for coolant use',
      '## Safety Considerations',
      'Always ensure the grinding wheel is rated for your machine\'s RPM. Never exceed the maximum operating speed marked on the wheel. Use appropriate guards and personal protective equipment.',
      '## Conclusion',
      'Choosing the right grinding wheel requires understanding your application requirements and matching them to wheel specifications. When in doubt, consult with our technical team at Motico Solutions for expert guidance.',
    ],
  },
  'ceramic-vs-zirconia': {
    title: 'Ceramic vs Zirconia Abrasives Explained',
    excerpt: 'Understanding the differences between ceramic and zirconia abrasives and when to use each type.',
    category: 'Technical',
    readTime: '7 min read',
    image: '/slide-5.png',
    date: 'February 10, 2025',
    content: [
      'When it comes to high-performance abrasives, ceramic and zirconia alumina are two of the most popular choices for demanding industrial applications. Understanding their differences will help you select the right abrasive for your specific needs.',
      '## What is Ceramic Abrasive?',
      'Ceramic abrasives are engineered from microcrystalline aluminum oxide using a sol-gel process. This creates an extremely hard, sharp grain structure that continually fractures to expose fresh cutting edges during use.',
      '## What is Zirconia Alumina?',
      'Zirconia alumina is a self-sharpening abrasive made by fusing aluminum oxide with zirconium oxide. This creates a tough, fracture-resistant grain ideal for aggressive stock removal.',
      '## Key Differences',
      '**Hardness:**',
      '- Ceramic: Harder, maintains sharp edges longer',
      '- Zirconia: Tough but slightly softer',
      '**Cutting Action:**',
      '- Ceramic: Micro-fracturing creates fresh sharp edges constantly',
      '- Zirconia: Self-sharpening through larger grain fractures',
      '**Heat Generation:**',
      '- Ceramic: Cooler cutting, less heat buildup',
      '- Zirconia: More heat generated during heavy grinding',
      '**Cost:**',
      '- Ceramic: Higher initial cost, but longer life often justifies expense',
      '- Zirconia: More economical upfront, excellent value for heavy grinding',
      '## When to Use Ceramic',
      '- Grinding hardened steels (above 45 HRC)',
      '- Stainless steel finishing',
      '- Precision applications requiring consistent finish',
      '- Applications where heat-sensitive materials are involved',
      '- When maximum belt/disc life is critical',
      '## When to Use Zirconia',
      '- Heavy stock removal on mild steel',
      '- Weld grinding and seam removal',
      '- Initial rough grinding before finishing',
      '- High-pressure applications',
      '- When cost per unit of material removed is priority',
      '## Performance Comparison',
      'In head-to-head testing on stainless steel:',
      '- Ceramic removes 20-40% more material over belt life',
      '- Ceramic produces finer, more consistent scratch pattern',
      '- Zirconia excels in first 50% of belt life for raw speed',
      '- Total cost of ownership often favors ceramic despite higher price',
      '## Conclusion',
      'Both ceramic and zirconia abrasives have their place in industrial operations. Ceramic excels when precision, surface finish, and belt life are priorities. Zirconia is the go-to choice for aggressive stock removal at competitive cost. Many operations use both, selecting based on the specific application requirements.',
    ],
  },
  'extending-belt-life': {
    title: 'Extending Belt Life: Pro Tips',
    excerpt: 'Industry secrets to maximize the lifespan of your abrasive belts and reduce operational costs.',
    category: 'Tips',
    readTime: '4 min read',
    image: '/slide-2-belt.png',
    date: 'February 5, 2025',
    content: [
      'Abrasive belts represent a significant consumable cost in metal fabrication and finishing operations. With proper techniques and maintenance, you can dramatically extend belt life and reduce costs. Here are proven tips from our technical experts.',
      '## 1. Proper Belt Break-In',
      'New belts benefit from a controlled break-in period:',
      '- Start with light pressure for the first few minutes',
      '- Gradually increase pressure as the initial sharp points condition',
      '- This prevents grain fracture from shock loading',
      '## 2. Maintain Correct Belt Tension',
      'Belt tension significantly impacts performance and life:',
      '- Too loose: Belt slips, causes glazing and uneven wear',
      '- Too tight: Excessive stress on joint, premature failure',
      '- Check tension regularly, especially on new belts',
      '## 3. Use Appropriate Contact Pressure',
      'More pressure isn\'t always better:',
      '- Excessive pressure causes heat buildup and rapid wear',
      '- Insufficient pressure leads to glazing',
      '- Let the belt do the work – moderate, consistent pressure is ideal',
      '## 4. Control Heat Buildup',
      'Heat is the enemy of belt life:',
      '- Use coolant when possible',
      '- Allow rest periods during heavy grinding',
      '- Ensure adequate airflow around contact wheel',
      '- Consider ceramic belts for heat-sensitive applications',
      '## 5. Clean Belts Regularly',
      'Metal loading reduces cutting efficiency:',
      '- Use belt cleaning sticks to remove metal particles',
      '- Clean before glazing becomes permanent',
      '- Some materials benefit from coarser cleaning sticks',
      '## 6. Match Belt to Material',
      'Using the right belt for the job extends life:',
      '- Ceramic for hardened steels and stainless',
      '- Zirconia for heavy stock removal on mild steel',
      '- Aluminum oxide for general-purpose finishing',
      '## 7. Proper Storage',
      'Store belts correctly to prevent damage:',
      '- Hang belts to prevent creasing',
      '- Control humidity – 40-60% is ideal',
      '- Avoid temperature extremes',
      '- Store away from direct sunlight',
      '## 8. Maintain Your Equipment',
      'Machine condition affects belt performance:',
      '- Check contact wheel for wear and damage',
      '- Ensure platens are flat and properly adjusted',
      '- Verify tracking mechanism is functioning correctly',
      '- Replace worn idler wheels',
      '## Real-World Results',
      'Implementing these practices typically yields:',
      '- 20-40% improvement in belt life',
      '- More consistent surface finish',
      '- Reduced downtime for belt changes',
      '- Lower overall abrasive costs',
      '## Conclusion',
      'Belt life extension is a combination of proper technique, maintenance, and product selection. Our technical team at Motico Solutions can help analyze your operation and recommend specific improvements.',
    ],
  },
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  if (!article) return { title: 'Article Not Found' }

  return {
    title: `${article.title} — Motico Solutions Blog`,
    description: article.excerpt,
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles[slug]

  if (!article) {
    notFound()
  }

  const otherArticles = Object.entries(articles)
    .filter(([key]) => key !== slug)
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src="/logo-motico-solutions.png" alt="Motico Solutions" width={150} height={45} className="h-16 w-auto" />
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero Image */}
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-8">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: article.category === 'Guides' ? '#bb0c15' : article.category === 'Technical' ? '#004D8B' : '#059669',
              color: 'white',
            }}
          >
            {article.category}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {article.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {article.content.map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4">{paragraph.replace('## ', '')}</h2>
            }
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <p key={index} className="font-semibold text-gray-800">{paragraph.replace(/\*\*/g, '')}</p>
            }
            if (paragraph.startsWith('- ')) {
              return <li key={index} className="text-gray-600 ml-4">{paragraph.replace('- ', '')}</li>
            }
            return <p key={index} className="text-gray-600 mb-4">{paragraph}</p>
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-2">Need Expert Advice?</h3>
          <p className="text-gray-600 mb-4">Our technical team is ready to help you find the right solutions for your application.</p>
          <Link
            href="/#cta"
            className="inline-flex items-center gap-2 bg-[#004D8B] text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-800 transition-colors"
          >
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      {/* Related Articles */}
      <section className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {otherArticles.map(([key, related]) => (
              <Link
                key={key}
                href={`/blog/${key}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={related.image}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{related.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="text-white font-semibold hover:text-red-400 transition-colors">
            ← Motico Solutions
          </Link>
          <p className="text-gray-500">Industrial Abrasives & Tools — Beirut, Lebanon</p>
        </div>
      </footer>
    </div>
  )
}
