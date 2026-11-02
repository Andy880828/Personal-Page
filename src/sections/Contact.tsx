import { useRef, useState } from 'react';
import { FileText, Send } from 'lucide-react';
import { profile } from '@/content/profile';
import { useReveal } from '@/hooks/useReveal';
import SectionHeader from '@/components/SectionHeader';
import ScienceNote from '@/components/ScienceNote';
import Picture from '@/components/Picture';
import { GithubIcon, FacebookIcon } from '@/components/BrandIcons';
import interests from '@/assets/img/interests.webp?w=640;1256&format=avif;webp&as=picture';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  key: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
const emailReady = Boolean(EMAIL.service && EMAIL.template && EMAIL.key);

const field =
  'w-full rounded-xl border border-foam/20 bg-abyss/60 px-4 py-3 text-ink placeholder:text-haze focus-visible:border-biolum focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biolum';

export default function Contact() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailReady) return;
    const form = e.currentTarget;
    setStatus('sending');
    try {
      // 只在送出時才載入 EmailJS，不佔首屏
      const { default: emailjs } = await import('@emailjs/browser');
      await emailjs.sendForm(EMAIL.service!, EMAIL.template!, form, { publicKey: EMAIL.key! });
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  const links = [
    { href: profile.links.github, label: 'GitHub', icon: <GithubIcon size={18} /> },
    { href: profile.links.resume, label: '履歷', icon: <FileText size={18} aria-hidden="true" /> },
    { href: profile.links.facebook, label: 'Facebook', icon: <FacebookIcon size={18} /> },
  ];

  return (
    <section
      id="contact"
      ref={scope}
      aria-labelledby="contact-title"
      className="relative px-5 pt-24 pb-10 lg:pt-[18vh] sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="contact"
          depth="4,000 m · 海床"
          title="到海床了，打聲招呼吧"
          lead="工作機會、合作、或只是想聊魚，都歡迎。"
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            <ul className="flex flex-wrap gap-3" data-reveal>
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-foam transition-colors hover:border-biolum/60 hover:text-biolum"
                  >
                    {l.icon}
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div data-reveal>
              <h3 className="text-lg font-bold text-foam">不在工作的時候</h3>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-2xl font-bold text-foam">
                {profile.interests.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>

            <figure data-reveal className="max-w-md">
              <Picture
                picture={interests}
                alt="登山、衝浪、潛水、彈烏克麗麗、看魚市場與遊戲的照片拼貼"
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="h-auto w-full"
              />
            </figure>
          </div>

          <div data-reveal>
            <form onSubmit={onSubmit} className="panel rounded-3xl p-7 sm:p-9" aria-describedby="contact-status">
              <h3 className="text-xl font-bold text-foam">寄一封信給我</h3>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-1.5 text-sm text-mist">
                  姓名
                  <input name="user_name" required autoComplete="name" className={field} />
                </label>
                <label className="grid gap-1.5 text-sm text-mist">
                  Email（我會回信到這裡）
                  <input name="user_email" type="email" required autoComplete="email" className={field} />
                </label>
                <label className="grid gap-1.5 text-sm text-mist">
                  訊息
                  <textarea name="message" required rows={5} className={`${field} resize-y`} />
                </label>
              </div>
              <button
                type="submit"
                disabled={!emailReady || status === 'sending'}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-biolum px-6 py-3 font-medium text-deep transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} aria-hidden="true" />
                {status === 'sending' ? '送出中…' : '送出'}
              </button>
              <p id="contact-status" role="status" className="mt-4 min-h-6 text-sm">
                {!emailReady && (
                  <span className="text-mist">表單暫時關閉，可以先到 GitHub 找我，或看履歷上的聯絡方式。</span>
                )}
                {status === 'sent' && <span className="text-biolum">收到了，我會盡快回覆你。</span>}
                {status === 'error' && (
                  <span className="text-coral">送出失敗了，內容還在，稍後再按一次送出；也可以先到 GitHub 找我。</span>
                )}
              </p>
            </form>
          </div>
        </div>

        <ScienceNote section="contact" className="mt-16" />

        <footer className="mt-[16vh] flex flex-col gap-3 border-t border-foam/10 pt-8 text-sm text-haze sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-foam">感謝你的造訪。</p>
          <p>© {profile.name} · 照片版權所有 · 用 React Three Fiber 打造</p>
        </footer>
      </div>
    </section>
  );
}
