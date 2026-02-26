import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Expert Insights & Guides | Motico Solutions',
  description: 'Learn from our 20+ years of industry experience. Tips, guides, and technical resources for industrial abrasives and tools.',
}

const articles = [
  {
    slug: 'how-to-choose-grinding-wheel',
    title: 'How to Choose the Right Grinding Wheel',
    excerpt: 'A comprehensive guide to selecting grinding wheels based on material, application, and finish requirements. Learn the key factors that determine grinding wheel performance.',
    category: 'Guides',
    readTime: '5 min read',
    image: '/slide-1.png',
    date: 'February 15, 2025',
  },
  {
    slug: 'ceramic-vs-zirconia',
    title: 'Ceramic vs Zirconia Abrasives Explained',
    excerpt: 'Understanding the differences between ceramic and zirconia abrasives and when to use each type. A detailed comparison for industrial applications.',
    category: 'Technical',
    readTime: '7 min read',
    image: '/slide-5.png',
    date: 'February 10, 2025',
  },
  {
    slug: 'extending-belt-life',
    title: 'Extending Belt Life: Pro Tips',
    excerpt: 'Industry secrets to maximize the lifespan of your abrasive belts and reduce operational costs. Practical tips from our technical experts.',
    category: 'Tips',
    readTime: '4 min read',
    image: '/slide-2-belt.png',
    date: 'February 5, 2025',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src="/logo-motico-solutions.png" alt="Motico Solutions" width={150} height={45} className="h-16 w-auto" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#004D8B] to-[#002d52] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Knowledge Base
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Expert Insights & Guides
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Learn from our 20+ years of industry experience. Tips, guides, and technical resources to help you choose the right abrasives.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: article.category === 'Guides' ? '#bb0c15' : article.category === 'Technical' ? '#004D8B' : '#059669',
                    color: 'white',
                  }}
                >
                  {article.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
                <h2 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#004D8B] transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <span className="text-sm font-semibold text-[#004D8B] flex items-center gap-1 group-hover:text-[#bb0c15] transition-colors">
                  Read More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Stay Updated</h2>
          <p className="text-gray-600 mb-6">Get the latest industry insights and product updates delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
            />
            <button className="px-6 py-3 bg-[#bb0c15] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </main>

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
