'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target,
  Microscope,
  Truck,
  Headset,
  Award,
  Users,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';

const VALUES = [
  {
    icon: Microscope,
    title: 'In-House R&D Facility',
    description:
      'Every wellness and fitness product is tested and refined in our facility to meet rigorous quality standards for Indian homes.',
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600',
  },
  {
    icon: Award,
    title: 'Manufacturer-Direct Quality',
    description:
      'High-grade healthcare and personal-care equipment delivered straight from manufacturing with uncompromised durability.',
    gradient: 'from-blue-500/10 to-cyan-500/10 text-blue-600',
  },
  {
    icon: Truck,
    title: 'Pan-India Delivery Network',
    description:
      'A rapidly growing distribution network covering tier-1, tier-2, and major cities across India with doorstep setup.',
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
  },
  {
    icon: Headset,
    title: 'Centralized 24/7 Support',
    description:
      'Dedicated call center and technical team ensuring prompt assistance, maintenance, and lifetime customer satisfaction.',
    gradient: 'from-purple-500/10 to-indigo-500/10 text-purple-600',
  },
];

const STATS = [
  { value: '2015', label: 'Year Established', sub: 'Over 11 years of trust' },
  { value: '100k+', label: 'Happy Customers', sub: 'Pan-India coverage' },
  { value: '50+', label: 'Product Range', sub: 'Massage chairs & fitness' },
  { value: '24/7', label: 'Dedicated Support', sub: 'Centralized helpdesk' },
];

const MILESTONES = [
  {
    year: '2015',
    title: 'Brand Foundation',
    description: 'Fit Forever India established as a premium luxury massage and fitness products manufacturer and leading retailer in India.',
  },
  {
    year: '2018',
    title: 'R&D Innovation Hub',
    description: 'Launched our dedicated in-house Research & Development facility to engineer fitness equipment for Indian households.',
  },
  {
    year: '2021',
    title: 'Pan-India Expansion',
    description: 'Expanded nationwide logistics and established physical showrooms in prime shopping destinations across India.',
  },
  {
    year: '2024',
    title: 'Wellness Ecosystem',
    description: 'Serving over 100,000 satisfied homes with next-generation massage chairs, smart treadmills, and commercial equipment.',
  },
];

const FEATURES = [
  'Rigorous In-House Quality & Stress Testing',
  'Manufacturer Direct Pricing & Warranty Support',
  'Doorstep Delivery & Professional On-Site Installation',
  'Pan-India Service Network & Genuine Spare Parts',
];

export default function AboutPage() {
  return (
    <>
      {/* Header Banner */}
      <PageHeader
        title="About Fit Forever India"
        subtitle="A premium luxury massage and fitness products manufacturer and leading retailer in India, since 2015."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
      />

      {/* Hero Overview Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="container-fit">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Our Story & Legacy
              </div>

              {/* Trust Badge: Manufacturer & Retailer Credential */}
              <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Award className="h-5 w-5" />
                </div>
                <p className="font-display text-sm font-bold leading-snug text-foreground sm:text-base">
                  Premium luxury massage and fitness products manufacturer and leading retailer in India
                  <span className="block text-xs font-semibold text-primary mt-0.5">Since 2015</span>
                </p>
              </div>

              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
                Empowering Healthy Homes Across India
              </h2>
              <div className="mt-6 space-y-4 font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
                <p>
                  Fit Forever India is a premium luxury massage and fitness products manufacturer and leading retailer in India, trusted by homes and businesses nationwide since 2015. We believe that premium wellness and fitness tools should be accessible to every household at direct, honest prices.
                </p>
                <p>
                  With our own state-of-the-art Research & Development facility, every massage chair, treadmill, and strength equipment is rigorously engineered, tested, and optimized before it enters your home.
                </p>
              </div>

              {/* Highlights Checklist */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span className="font-sans text-sm font-semibold text-foreground">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/products">
                    Explore Our Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-slate-200 dark:border-border">
                  <Link href="/outlets">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    Visit Our Showrooms
                  </Link>
                </Button>
              </div>
            </Reveal>

            {/* Visual Showcase Card Stack */}
            <Reveal delay={0.2} className="relative">
              <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl border border-slate-100 dark:border-border">
                <img
                  src="https://images.pexels.com/photos/7174396/pexels-photo-7174396.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Fit Forever wellness technology"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base">In-House Tested & Certified</h4>
                      <p className="text-xs text-white/80 mt-0.5">Built to withstand heavy daily use with 100% genuine warranty.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Modern Stats Banner */}
      <section className="border-y border-border bg-slate-900 text-white py-12 sm:py-16">
        <div className="container-fit">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08} className="text-center">
                <div className="font-display text-4xl font-extrabold text-primary sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 font-display text-base font-bold text-white sm:text-lg">
                  {stat.label}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {stat.sub}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-[#F8F9FA] py-16 sm:py-24 dark:bg-muted/20">
        <div className="container-fit">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              WHAT DRIVES US
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Our Core Principles & Commitment
            </h2>
            <p className="mt-3 font-sans text-muted-foreground">
              Built on quality, innovation, and long-term customer relationships.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="group relative flex flex-col justify-between h-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-card dark:border-border">
                  <div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} transition-transform group-hover:scale-110`}>
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-border flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
                    Learn More <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Timeline / Milestones */}
      <section className="py-16 sm:py-24">
        <div className="container-fit">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              OUR JOURNEY
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              Milestones of Growth
            </h2>
            <p className="mt-3 font-sans text-muted-foreground">
              From our inception in 2006 to becoming a nationwide wellness brand.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
            {MILESTONES.map((m, i) => (
              <Reveal key={m.year} delay={i * 0.1}>
                <div className="relative flex flex-col h-full rounded-3xl border border-slate-100 bg-slate-50/50 p-6 dark:bg-card dark:border-border">
                  <div className="font-display text-3xl font-black text-primary">
                    {m.year}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                    {m.title}
                  </h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom & Nationwide Presence Section */}
      <section className="bg-slate-900 py-16 sm:py-20 text-white relative overflow-hidden">
        <div className="container-fit grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              NATIONWIDE SHOWROOMS
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Experience Our Equipment In Person
            </h2>
            <p className="mt-4 font-sans text-base leading-relaxed text-slate-300">
              Visit our luxury showrooms located in major cities and prominent shopping centers to try our zero-gravity massage chairs, smart treadmills, and workout stations firsthand.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold">Premium Malls & Showrooms</h4>
                  <p className="text-xs text-slate-400">Convenient locations across major Indian metro cities.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary">
                  <Headset className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold">Expert Consultation & Support</h4>
                  <p className="text-xs text-slate-400">Our wellness experts guide you to choose the perfect fit for your home.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/outlets">
                  <MapPin className="mr-2 h-4 w-4" />
                  Locate Showroom Near You
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-white/10">
                <img
                  src="https://images.pexels.com/photos/35215412/pexels-photo-35215412.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Fit Forever showroom"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-white/10 mt-6">
                <img
                  src="https://res.cloudinary.com/ufptbplr/image/upload/v1786000626/massagechairhero_nkpobu.jpg"
                  alt="Fit Forever massage chair setup"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container-fit">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-orange-600 px-8 py-14 text-center sm:px-16 text-white shadow-2xl">
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                Ready to Upgrade Your Wellness Lifestyle?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl font-sans text-white/90 sm:text-lg">
                Explore our full catalog of massage chairs, home gyms, and fitness machines with direct manufacturer warranty and pan-India service.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold">
                  <Link href="/products">
                    Shop All Products
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white hover:text-slate-900">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

