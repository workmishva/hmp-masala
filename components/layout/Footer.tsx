import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { getSettings } from '@/lib/getSettings'

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export async function Footer() {
  const settings   = await getSettings()
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber || process.env.WHATSAPP_NUMBER || ''}`

  return (
    <footer className="bg-masala-900 text-masala-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* ── Brand ── */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo/logo_bg_removed.png"
                alt="HMP Masala Logo"
                width={120}
                height={44}
                style={{ width: 'auto', height: '44px' }}
                className="object-contain"
              />
              <span className="text-2xl font-brand font-black text-white tracking-tight">
                HMP Masala
              </span>
            </div>
            <p className="text-masala-400 leading-relaxed text-sm max-w-sm">
              Authentic Indian spices, crafted with love and tradition.
              Elevate your everyday meals with the purest ingredients from nature.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/1Gyabdatgr/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-masala-800 flex items-center justify-center text-masala-400 hover:bg-chili-600 hover:text-white transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/hmp.masala?igsh=YjEwNGp3MG9ycDIy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-masala-800 flex items-center justify-center text-masala-400 hover:bg-chili-600 hover:text-white transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbC9uIR65yDEZzkuB63X"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Channel"
                className="w-10 h-10 rounded-full bg-masala-800 flex items-center justify-center text-masala-400 hover:bg-cardamom-600 hover:text-white transition-colors"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-4">
              {[
                { href: '/',          label: 'Home' },
                { href: '/products',  label: 'Shop Spices' },
                { href: '/my-orders', label: 'My Orders' },
                { href: '/profile',   label: 'My Profile' },
                { href: '/cart',      label: 'Cart' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-masala-400 hover:text-saffron-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              Contact Us
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm text-masala-400">
                <MapPin size={18} className="text-saffron-400 shrink-0 mt-0.5" />
                <span>
                  At Padapan, Ta. Gadhadha (Swa.),<br />
                  Di. Botad, Gujarat, India — 364730
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-masala-400">
                <Phone size={18} className="text-saffron-400 shrink-0" />
                <a href="tel:+918780606650"
                  className="hover:text-saffron-400 transition-colors">
                  +91 87806 06650
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-masala-400">
                <Mail size={18} className="text-saffron-400 shrink-0" />
                <a href="mailto:kishanfarm20@gmail.com"
                  className="hover:text-saffron-400 transition-colors break-all">
                  kishanfarm20@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* ── WhatsApp CTA ── */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              Chat With Us
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MessageCircle size={20} className="text-cardamom-400 shrink-0 mt-0.5" />
                <p className="text-white text-sm font-medium leading-snug">
                  Questions? We&apos;re Just a Message Away
                </p>
              </div>
              <p className="text-masala-400 text-sm leading-relaxed">
                Chat with us on WhatsApp for orders, custom requests, or anything about our masalas.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-cardamom-600 hover:bg-cardamom-700 text-white text-sm font-semibold rounded-xl transition-colors w-fit"
              >
                <MessageCircle size={15} />
                Open WhatsApp
              </a>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-masala-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-masala-500">
          <p>© {new Date().getFullYear()} HMP Masala. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-masala-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-masala-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-masala-300 transition-colors">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
