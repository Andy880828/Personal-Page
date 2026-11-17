import { useRef, useState } from 'react';
import { Check, Copy, FileText, Mail, Send } from 'lucide-react';
import { profile } from '@/content/profile';
import { flags } from '@/lib/env';
import { useReveal } from '@/hooks/useReveal';
import SectionHeader from '@/components/SectionHeader';
import Picture from '@/components/Picture';
import { GithubIcon, FacebookIcon } from '@/components/BrandIcons';
import interests from '@/assets/img/interests.webp?w=640;1256&format=avif;webp&as=picture';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  key: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
const emailReady = Boolean(EMAIL.service && EMAIL.template && EMAIL.key) && !flags.noForm;

const field =
  'w-full rounded-xl border border-foam/20 bg-abyss/60 px-4 py-3 text-ink placeholder:text-haze focus-visible:border-biolum focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biolum';

/** Email：可以直接點開信件，也可以一鍵複製（很多人用網頁版信箱，mailto 開不起來） */
function EmailRow() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 剪貼簿被擋：使用者還是可以點信箱連結 */
    }
  };
  return (
    <div className="flex items-stretch gap-2">
      <a
        href={`mailto:${profile.email}`}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-biolum/40 px-4 py-3 text-foam transition-colors hover:border-biolum hover:text-biolum"
      >
        <Mail size={18} aria-hidden="true" className="shrink-0" />
        <span className="min-w-0 font-mono text-sm break-all xl:text-base">{profile.email}</span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Email 已複製' : '複製 Email'}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-foam/15 px-3 text-sm text-mist transition-colors hover:border-biolum/60 hover:text-biolum"
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {copied ? '已複製' : '複製'}
      </button>
      <span className="sr-only" role="status">
        {copied ? 'Email 已複製到剪貼簿' : ''}
      </span>
    </div>
  );
}

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
    { href: profile.links.resume, label: '履歷', icon: <FileText size={18} aria-hidden="true" /> },
    { href: profile.links.github, label: 'GitHub', icon: <GithubIcon size={18} /> },
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
        <SectionHeader id="contact" title="到海床了，打聲招呼吧" lead="工作機會、合作，或只是想聊魚，都歡迎。" />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="min-w-0 space-y-10 lg:order-2">
            {/* 表單關閉時「聯絡我」卡片已經有這三個連結，這排就不重複顯示 */}
            {emailReady && (
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
            )}

            <div data-reveal>
              <h3 className="text-lg font-bold text-foam">不在工作的時候</h3>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-lg font-medium text-ink/90">
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

          {/* 手機上聯絡卡排在興趣與照片之前 */}
          <div data-reveal className="order-first min-w-0 lg:order-1">
            {!emailReady ? (
              <div className="panel rounded-3xl p-7 sm:p-9">
                <h3 className="text-xl font-bold text-foam">聯絡我</h3>
                <p className="mt-3 text-ink/85">寫信最快，履歷和 GitHub 在下面。</p>
                <div className="mt-6">
                  <EmailRow />
                </div>
                <ul className="mt-3 grid gap-3">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-foam/15 px-4 py-3 text-foam transition-colors hover:border-biolum/60 hover:text-biolum"
                      >
                        <span className="inline-flex items-center gap-2">
                          {l.icon}
                          {l.label}
                        </span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="panel rounded-3xl p-7 sm:p-9" aria-describedby="contact-status">
                <h3 className="text-xl font-bold text-foam">寄一封信給我</h3>
                <p className="mt-2 text-sm text-mist">
                  或直接寫信到{' '}
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-foam underline underline-offset-2 hover:text-biolum"
                  >
                    {profile.email}
                  </a>
                </p>
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
                  disabled={status === 'sending'}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-biolum px-6 py-3 font-medium text-deep transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} aria-hidden="true" />
                  {status === 'sending' ? '寄送中…' : '寄出'}
                </button>
                <p id="contact-status" role="status" className="mt-4 min-h-6 text-sm">
                  {status === 'sent' && <span className="text-biolum">收到了，我會盡快回覆你。</span>}
                  {status === 'error' && (
                    <span className="text-coral">
                      沒寄出去，內容還在。請稍後再按一次「寄出」，或直接寫信到 {profile.email}。
                    </span>
                  )}
                </p>
              </form>
            )}
          </div>
        </div>

        <footer className="mt-[16vh] flex flex-col gap-3 border-t border-foam/10 pt-8 text-sm text-haze sm:flex-row sm:items-baseline sm:justify-between md:pl-14">
          <p className="text-foam">謝謝你潛到最底。</p>
          <p>
            © 2026 {profile.name} · 照片版權所有，未經同意請勿轉載 ·{' '}
            <a
              href="https://github.com/Andy880828/Personal-Page#科學資料來源"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-haze/50 underline-offset-2 hover:text-foam"
            >
              科學資料來源
            </a>
          </p>
        </footer>
      </div>
    </section>
  );
}
