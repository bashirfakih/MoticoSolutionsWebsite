'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Phone, MessageCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react'

// Product data for Air & Power Tools
const productData: Record<string, {
  title: string
  subtitle: string
  description: string
  longDescription: string
  images: string[]
  features: string[]
  technicalData: { label: string; value: string }[]
  applications: string[]
  brands: string[]
  relatedProducts: { slug: string; title: string; image: string }[]
}> = {
  'poly-ptx-802-ht-linear-grinder': {
    title: 'POLY-PTX 802 HT Linear Grinder',
    subtitle: 'High Torque Linear Grinding Machine',
    description: 'The inventor of the hand-held linear grinding machine introduces a refinement with unmatched torque and performance.',
    longDescription: 'The POLY-PTX 802 HT (high torque) linear grinder offers a torque and performance profile that is unmatched. The newly developed planetary gear distributes traction across additional gear wheels in a sophisticated arrangement, greatly increasing all drive components\' resistance to wear and making it a continuous runner. The shaft handle features rubberised inserts for optimal grip during linear grinding, satin finishing, or polishing, ensuring uniform grinding results entirely free of shadows. The drive spindle is corrosion-free stainless steel with self-centring knurled screw attachment.',
    images: [
      '/poly-ptx-802-ht-linear-grinder_01.jpg',
      '/poly-ptx-802-ht-linear-grinder_02.jpg',
      '/poly-ptx-802-ht-linear-grinder_03.jpg',
      '/poly-ptx-802-ht-linear-grinder_04.jpg',
      '/poly-ptx-802-ht-linear-grinder_05.jpg',
      '/poly-ptx-802-ht-linear-grinder_06.jpg',
      '/poly-ptx-802-ht-linear-grinder_07.jpg',
      '/poly-ptx-802-ht-linear-grinder_08.jpg',
      '/poly-ptx-802-ht-linear-grinder_09.jpg',
      '/poly-ptx-802-ht-linear-grinder_10.jpg',
    ],
    features: [
      'New HT (High Torque) planetary gear technology',
      'Unmatched torque and performance profile',
      'Rubberised handle inserts for optimal grip',
      'Corrosion-free stainless steel drive spindle',
      'Self-centring knurled screw with rotary protection',
      'Robust aluminium pressure casting protective cover',
      'Optional suction cover with suction sockets',
      'Retractable polycarbonate eye protection',
      '100% Made in Germany',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Linear Grinder' },
      { label: 'Power', value: '1,750 Watts' },
      { label: 'Drive', value: 'HT Planetary Gear' },
      { label: 'Tool Mount', value: 'Self-centring knurled screw' },
      { label: 'Grinding Width', value: 'Up to 150 mm (Eco Smart)' },
      { label: 'Origin', value: 'Made in Germany' },
    ],
    applications: [
      'Linear grinding on stainless steel',
      'Satin finishing',
      'Mirror polishing',
      'Surface preparation',
      'Shadow-free finishing',
    ],
    brands: ['Eisenblätter'],
    relatedProducts: [
      { slug: 'rohr-max-802-ht-belt-grinder', title: 'ROHR MAX 802 HT', image: '/rohr-max-802-ht-belt-grinder-for-pipe_01.jpg' },
      { slug: 'mini-max-1100-multifunctional-grinder', title: 'MINI MAX 1100', image: '/mini-max-1100-multifunctional-grinder_01.jpg' },
    ],
  },
  'rohr-max-802-ht-belt-grinder': {
    title: 'ROHR MAX 802 HT Pipe Belt Grinder',
    subtitle: 'Professional Pipe Sanding & Polishing',
    description: 'Multifunctional, gas pressure-damped pipe belt sander for perfect sanding and polishing of pipe constructions.',
    longDescription: 'The ROHR MAX 802 HT is a multifunctional, gas pressure-damped pipe belt sander for perfect sanding and polishing of closed and open pipe constructions. From small to large pipe diameters, this machine delivers homogeneous, even results. Thanks to a newly developed planetary gear, the frictional connection is now distributed over three additional, cleverly arranged gears, dramatically increasing longevity and pulling power. The patented damping concept with gas pressure damper enables maximum "tube enclosure" of the grinding and polishing belts without great effort.',
    images: [
      '/rohr-max-802-ht-belt-grinder-for-pipe_01.jpg',
      '/rohr-max-802-ht-belt-grinder-for-pipe_02.jpg',
      '/rohr-max-802-ht-belt-grinder-for-pipe_03.jpg',
      '/rohr-max-802-ht-belt-grinder-for-pipe_04.jpg',
      '/rohr-max-802-ht-belt-grinder-for-pipe_05.jpg',
      '/rohr-max-802-ht-belt-grinder-for-pipe_06.jpg',
    ],
    features: [
      'Belt dimensions 40 x 780 mm',
      'Ideal for pipes Ø 40 - 130 mm',
      '1,750 Watts powerful motor',
      'HT (High Torque) gear mechanism',
      'Speed range 820 - 3,000 rpm',
      'Belt speed 4 - 14 m/sec',
      'Tachometer generator for constant speed',
      'Patented gas pressure damper',
      '100% Made in Germany',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Pipe Belt Grinder' },
      { label: 'Power', value: '1,750 Watts' },
      { label: 'Belt Size', value: '40 x 780 mm' },
      { label: 'Pipe Diameter', value: '40 - 130 mm' },
      { label: 'Speed Range', value: '820 - 3,000 rpm' },
      { label: 'Belt Speed', value: '4 - 14 m/sec' },
      { label: 'Origin', value: 'Made in Germany' },
    ],
    applications: [
      'Pipe sanding and polishing',
      'Closed pipe constructions',
      'Open pipe constructions',
      'Stainless steel pipes',
      'Weld seam finishing',
    ],
    brands: ['Eisenblätter'],
    relatedProducts: [
      { slug: 'poly-ptx-802-ht-linear-grinder', title: 'POLY-PTX 802 HT', image: '/poly-ptx-802-ht-linear-grinder_01.jpg' },
      { slug: 'gladius-1802-ht-grinding-sword', title: 'GLADIUS 1802 HT', image: '/gladius-1802-ht-multifunctional-grinding-sword_01.jpg' },
    ],
  },
  'gladius-1802-ht-grinding-sword': {
    title: 'GLADIUS 1802 HT Grinding Sword',
    subtitle: 'Multifunctional Grinding Sword',
    description: 'Unique grinding sword with universal grinding properties. Can be used handheld or as a stationary machine.',
    longDescription: 'The GLADIUS 1802 HT is a unique grinding sword with universal grinding properties and an attachable stop system for grinding precise angles and radii. It can be used either as a hand-held device or, thanks to the optional ball-and-socket joint holder, as a stationary machine. Grinding, smoothing, deburring, derusting, descaling, sharpening, and polishing are now possible with lightning speed. The extra-long work area enables one-sided or two-sided machining, even on workpieces that are difficult to access. Almost all metals, plastics, stone, and wood can be processed by simply changing the belt.',
    images: [
      '/gladius-1802-ht-multifunctional-grinding-sword_01.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_02.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_03.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_04.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_05.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_06.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_07.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_08.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_09.jpg',
      '/gladius-1802-ht-multifunctional-grinding-sword_10.jpg',
    ],
    features: [
      'Belt dimensions 40 x 780 mm',
      'Mobile and stationary use',
      'Optional angle attachment for constant angle grinding',
      'Optional table ball joint holder',
      'Special alloy tape guide for reduced temperatures',
      'Fast belt changing system',
      'Extra-long work area',
      'Universal for metals, plastic, stone, wood',
      '100% Made in Germany',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Grinding Sword' },
      { label: 'Belt Size', value: '40 x 780 mm' },
      { label: 'Use Mode', value: 'Handheld / Stationary' },
      { label: 'Materials', value: 'Metal, Plastic, Stone, Wood' },
      { label: 'Origin', value: 'Made in Germany' },
    ],
    applications: [
      'Flat grinding and polishing',
      'Knife and tool sharpening',
      'Deburring and derusting',
      'Descaling',
      'Pipe end grinding',
      'Breakthrough grinding',
    ],
    brands: ['Eisenblätter'],
    relatedProducts: [
      { slug: 'band-it-1100-power-file', title: 'BAND-IT 1100', image: '/band-it-1100-power-file_01.jpg' },
      { slug: 'poly-ptx-802-ht-linear-grinder', title: 'POLY-PTX 802 HT', image: '/poly-ptx-802-ht-linear-grinder_01.jpg' },
    ],
  },
  'band-it-1100-power-file': {
    title: 'BAND-IT 1100 Power File',
    subtitle: 'Compact Belt File',
    description: 'Compact belt file ideal for working in tight spaces - edges, folds and corners in railing and metal construction.',
    longDescription: 'The BAND-IT 1100 belt file has an even more robust drive for continuous professional use. Due to the compact, narrow design, it is ideal for working in tight spaces such as edges, folds, and corners. Particularly interesting for railing, apparatus, tool, and metal construction. Sanding and polishing belts are automatically guided and adjusted. The pre-tensioning can also be locked using a knurled screw for firmer contact pressure and precise work. Can be used mobile or stationary with table ball joint holder.',
    images: [
      '/band-it-1100-power-file_01.jpg',
      '/band-it-1100-power-file_02.jpg',
      '/band-it-1100-power-file_03.jpg',
      '/band-it-1100-power-file_04.jpg',
      '/band-it-1100-power-file_05.jpg',
      '/band-it-1100-power-file_06.jpg',
      '/band-it-1100-power-file_07.jpg',
      '/band-it-1100-power-file_08.jpg',
      '/band-it-1100-power-file_09.jpg',
    ],
    features: [
      'Compact narrow design for tight spaces',
      'For 5mm and 9mm belt widths',
      'Belt change in seconds',
      'Brass pulleys with needle roller bearings',
      'Automatic belt guidance and adjustment',
      'Lockable pre-tensioning',
      '1,100 Watts balanced power',
      'Speed controlled 2,800 - 9,600 rpm',
      'Dust-protected spring damping',
      '100% Made in Germany',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Belt File / Power File' },
      { label: 'Power', value: '1,100 Watts' },
      { label: 'Belt Widths', value: '5 mm and 9 mm' },
      { label: 'Belt Length', value: '533 mm' },
      { label: 'Speed Range', value: '2,800 - 9,600 rpm' },
      { label: 'Belt Speed', value: '4 - 14 m/sec' },
      { label: 'Mains', value: '220-240V ~ 50-60 Hz' },
      { label: 'Origin', value: 'Made in Germany' },
    ],
    applications: [
      'Working in tight spaces',
      'Edges and folds',
      'Corners and difficult areas',
      'Railing construction',
      'Metal construction',
      'Tool and apparatus work',
    ],
    brands: ['Eisenblätter'],
    relatedProducts: [
      { slug: 'gladius-1802-ht-grinding-sword', title: 'GLADIUS 1802 HT', image: '/gladius-1802-ht-multifunctional-grinding-sword_01.jpg' },
      { slug: 'mini-max-1100-multifunctional-grinder', title: 'MINI MAX 1100', image: '/mini-max-1100-multifunctional-grinder_01.jpg' },
    ],
  },
  'mini-max-1100-multifunctional-grinder': {
    title: 'MINI MAX 1100 Multifunctional Grinder',
    subtitle: 'Versatile Mini Grinder',
    description: 'Versatile mini grinder with improved dust protection. Perfect longitudinal guidance for shadow-free surfaces.',
    longDescription: 'The MINI MAX 1100 promises significantly more power reserves for continuous professional use. In addition to the new powerful speed-controlled drive motor, it features improved dust protection and mechanics. The speed ranges have been expanded offering the ideal drive device for a variety of mini shaft tools (fleece, mop, polisher) with perfect longitudinal guidance for clean, shadow-free surfaces. Thanks to balanced weight distribution, you can work completely fatigue-free for many hours. Ideal for service, repair, assembly, motor vehicles, and painting workshops.',
    images: [
      '/mini-max-1100-multifunctional-grinder_01.jpg',
      '/mini-max-1100-multifunctional-grinder_02.jpg',
      '/mini-max-1100-multifunctional-grinder_03.jpg',
      '/mini-max-1100-multifunctional-grinder_04.jpg',
      '/mini-max-1100-multifunctional-grinder_05.jpg',
      '/mini-max-1100-multifunctional-grinder_06.jpg',
      '/mini-max-1100-multifunctional-grinder_07.jpg',
      '/mini-max-1100-multifunctional-grinder_08.jpg',
    ],
    features: [
      'Speed-controlled 1,100W drive motor',
      'Improved dust protection',
      'Perfect longitudinal guidance',
      'Balanced weight distribution',
      'Ideal for mini shaft tools (6mm)',
      'New air duct system for reduced temperature',
      'Compatible with MINI FIX and PINLOC systems',
      'Also works with ROLOC, FASTLOCK, etc.',
      '100% Made in Germany',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Multifunctional Grinder' },
      { label: 'Power', value: '1,100 Watts' },
      { label: 'Shaft', value: '6 mm' },
      { label: 'Speed', value: 'Variable, speed-controlled' },
      { label: 'Compatible Systems', value: 'MINI FIX, PINLOC, ROLOC, FASTLOCK' },
      { label: 'Origin', value: 'Made in Germany' },
    ],
    applications: [
      'Coarse and fine sanding',
      'Satin and matt finishing',
      'Mirror polishing',
      'Mini angle sanding',
      'Service and repair',
      'Motor vehicle finishing',
      'Painting workshop prep',
    ],
    brands: ['Eisenblätter'],
    relatedProducts: [
      { slug: 'varilex-wsf-1100-angle-grinder', title: 'VARILEX WSF 1100', image: '/varilex-wsf-1100-compact-angle-grinder_01.jpg' },
      { slug: 'poly-ptx-802-ht-linear-grinder', title: 'POLY-PTX 802 HT', image: '/poly-ptx-802-ht-linear-grinder_01.jpg' },
    ],
  },
  'varilex-wsf-1100-angle-grinder': {
    title: 'VARILEX WSF 1100 Angle Grinder',
    subtitle: 'Compact Variable Speed Angle Grinder',
    description: 'Compact angle grinder with 1,100W variable speed. Smallest handle circumference in its class for fatigue-free grinding.',
    longDescription: 'The VARILEX WSF 1100 is a new, particularly handy compact angle grinder with 1,100 watts of power and variable speed. A robust slip clutch is integrated, preventing possible jamming of the discs for particularly safe work. The constant electronics ensure continuously variable speeds between 2,800 and 9,600 rpm. The smallest handle circumference in its performance class allows for fatigue-free grinding in perfect ergonomics. The "Marathon-Motor" offers 30% higher power reserves with up to 50% more torque compared to comparable devices.',
    images: [
      '/varilex-wsf-1100-compact-angle-grinder_01.jpg',
      '/varilex-wsf-1100-compact-angle-grinder_02.jpg',
      '/varilex-wsf-1100-compact-angle-grinder_03.jpg',
      '/varilex-wsf-1100-compact-angle-grinder_04.jpg',
      '/varilex-wsf-1100-compact-angle-grinder_05.jpg',
      '/varilex-wsf-1100-compact-angle-grinder_06.jpg',
      '/varilex-wsf-1100-compact-angle-grinder_07.jpg',
      '/varilex-wsf-1100-compact-angle-grinder_08.jpg',
    ],
    features: [
      'Smallest handle circumference in class',
      '"Marathon-Motor" with 30% higher reserves',
      '50% more torque than competitors',
      'Maximum service life with dust protection',
      'Ideal speed range for flap discs up to Ø 125mm',
      'Variable speed 2,800 - 9,600 rpm',
      'Toolless adjustable protective hood',
      'Mechanical safety clutch (anti kick-back)',
      '100% Made in Germany',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Compact Angle Grinder' },
      { label: 'Power', value: '1,100 Watts' },
      { label: 'Max Disc Diameter', value: '125 mm' },
      { label: 'Speed Range', value: '2,800 - 9,600 rpm' },
      { label: 'Safety', value: 'Mechanical slip clutch' },
      { label: 'Origin', value: 'Made in Germany' },
    ],
    applications: [
      'One-hand and two-hand grinding',
      'Flap disc applications',
      'Stainless steel processing',
      'Surface treatment',
      'Cutting and grinding',
    ],
    brands: ['Eisenblätter'],
    relatedProducts: [
      { slug: 'mini-max-1100-multifunctional-grinder', title: 'MINI MAX 1100', image: '/mini-max-1100-multifunctional-grinder_01.jpg' },
      { slug: 'band-it-1100-power-file', title: 'BAND-IT 1100', image: '/band-it-1100-power-file_01.jpg' },
    ],
  },
}

// Default product for unknown slugs
const defaultProduct = {
  title: 'Power Tool',
  subtitle: 'Industrial Quality',
  description: 'High-quality power tool for industrial applications.',
  longDescription: 'Contact us for detailed product specifications.',
  images: ['/product-air-power-tools.png'],
  features: ['Professional grade', 'Industrial quality', 'German engineering'],
  technicalData: [{ label: 'Category', value: 'Power Tools' }],
  applications: ['Industrial grinding', 'Surface finishing'],
  brands: ['Eisenblätter'],
  relatedProducts: [],
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const product = productData[slug] || defaultProduct

  const [selectedImage, setSelectedImage] = useState(0)

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <Link href="/products/air-power-tools" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Power Tools
          </Link>
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-4">
            <Image src="/logo-motico-solutions.png" alt="Motico Solutions" width={180} height={54} className="h-24 w-auto" />
          </Link>
          <a
            href="tel:+9613741565"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-blue-800 border border-blue-800 px-4 py-2 rounded-full hover:bg-blue-800 hover:text-white transition-all"
          >
            <Phone className="w-4 h-4" />
            +961 3 741 565
          </a>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200 px-6 py-2.5 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/#products" className="hover:text-blue-700 transition-colors">Products</Link>
          <span className="text-gray-300">/</span>
          <Link href="/products/air-power-tools" className="hover:text-blue-700 transition-colors">Air & Power Tools</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.title}</span>
        </div>
      </nav>

      {/* Product Detail */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden group">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
                {/* Brand Badge */}
                <span className="absolute top-4 left-4 bg-blue-900 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                  {product.brands[0]}
                </span>
              </div>
              {/* Thumbnail Grid */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-blue-800 ring-2 ring-blue-800/20' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-blue-800 font-semibold text-sm uppercase tracking-wide mb-2">{product.subtitle}</p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.title}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{product.longDescription}</p>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Key Features</h3>
                <ul className="grid gap-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <a
                  href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20the%20${encodeURIComponent(product.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-full transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Request Quote
                </a>
                <a
                  href="tel:+9613741565"
                  className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5" /> Call Us
                </a>
              </div>
            </div>
          </div>

          {/* Technical Data & Applications */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {/* Technical Data */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Technical Data
              </h3>
              <table className="w-full">
                <tbody>
                  {product.technicalData.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2.5 px-3 text-gray-600 font-medium">{item.label}</td>
                      <td className="py-2.5 px-3 text-gray-900">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Applications */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Applications
              </h3>
              <ul className="grid gap-2">
                {product.applications.map((app, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related Products */}
          {product.relatedProducts.length > 0 && (
            <div className="mt-16">
              <h3 className="font-bold text-gray-900 text-xl mb-6">Related Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {product.relatedProducts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/products/air-power-tools/${related.slug}`}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <Image src={related.image} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-800 transition-colors">{related.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="text-white font-semibold text-base hover:text-red-400 transition-colors">
            ← Motico Solutions
          </Link>
          <p className="text-gray-500">Industrial Abrasives & Tools — Beirut, Lebanon</p>
          <div className="flex gap-6">
            <a href="/#products" className="hover:text-white transition-colors">All Products</a>
            <a href="tel:+9613741565" className="hover:text-white transition-colors">+961 3 741 565</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
