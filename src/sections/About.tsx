import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { profile } from '@/content/profile';
import { useReveal } from '@/hooks/useReveal';
import SectionHeader from '@/components/SectionHeader';
import Picture from '@/components/Picture';
import avatar from '@/assets/img/avatar.jpg?w=240;480&format=avif;webp;jpg&as=picture';

export default function About() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  return (
    <section
      id="about"
      ref={scope}
      aria-labelledby="about-title"
      className="relative px-5 pt-16 pb-24 lg:pt-[12vh] lg:pb-[18vh] sm:px-10 lg:px-16"
    >
      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <div>
          <SectionHeader id="about" title="從溪流的 DNA，到資料流的 DNA" />
          <div className="mt-8 space-y-5 text-lg text-ink/90">
            {profile.intro.map((p) => (
              <p key={p} data-reveal>
                {p}
              </p>
            ))}
          </div>
          <a
            href={profile.links.resume}
            target="_blank"
            rel="noreferrer"
            data-reveal
            className="mt-9 inline-flex items-center gap-1.5 border-b border-biolum/60 pb-1 font-medium text-biolum transition-colors hover:border-biolum hover:text-foam"
          >
            看完整履歷
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <aside className="flex flex-col gap-10 lg:pt-24" aria-label="大頭照、語言成績與證照">
          <figure data-reveal className="relative w-44 sm:w-52">
            <span
              aria-hidden="true"
              className="absolute -inset-3 rounded-full border border-biolum/30 [mask-image:linear-gradient(140deg,black,transparent_70%)]"
            />
            <Picture
              picture={avatar}
              alt={`${profile.name}的大頭照`}
              sizes="208px"
              className="aspect-square w-full rounded-full object-cover object-top"
            />
          </figure>

          <div data-reveal>
            <h3 className="text-lg font-bold text-foam">語言成績與證照</h3>
            <dl className="mt-4 divide-y divide-foam/10 border-y border-foam/10">
              {profile.certificates.map((c) => (
                <div key={c.name} className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-ink/90">{c.name}</dt>
                  <dd className="font-mono text-lg text-ember tabular-nums">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
