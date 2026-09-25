import { Clock3, Mail, MapPin, MessageCircle, Phone, Globe } from "lucide-react";
import type { UpsiteConfig } from "@/lib/config";
import type { Source } from "@/lib/source";

type Contact = NonNullable<UpsiteConfig["site"]["contact"]>;

export function SiteFooter({
  contact,
  source,
}: {
  contact?: Contact;
  source: Source;
}) {
  const phoneHref = contact?.phone?.replace(/\s+/g, "");
  const whatsappHref = contact?.whatsapp?.replace(/\D/g, "");

  return (
    <footer className="mt-12 border-t border-edge/70 pt-8 sm:mt-16 sm:pt-10">
      {contact && (
        <section
          aria-label="Altify contact"
          className="glass bevel mb-8 rounded-2xl border border-edge p-5 sm:p-6"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-medium tracking-wide text-ink">Need help?</h2>
              <p className="mt-1 text-xs text-ink-faint sm:text-[13px]">
                Reach Altify Solutions — we usually reply within one business day (EAT).
              </p>
            </div>
            {contact.website && (
              <a
                href={contact.website}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex items-center gap-1.5 self-start text-xs text-signal transition hover:text-ink sm:mt-0"
              >
                <Globe className="h-3.5 w-3.5" />
                altifysolutions.com
              </a>
            )}
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contact.email && (
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-start gap-3 rounded-xl border border-edge/80 bg-abyss/50 px-3.5 py-3 transition hover:border-signal/35 hover:bg-signal/[0.04]"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-ink-faint">
                      Email
                    </span>
                    <span className="mt-0.5 block break-all text-sm text-ink">{contact.email}</span>
                  </span>
                </a>
              </li>
            )}

            {contact.phone && phoneHref && (
              <li>
                <a
                  href={`tel:${phoneHref}`}
                  className="flex items-start gap-3 rounded-xl border border-edge/80 bg-abyss/50 px-3.5 py-3 transition hover:border-signal/35 hover:bg-signal/[0.04]"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-ink-faint">
                      Phone
                    </span>
                    <span className="mt-0.5 block text-sm text-ink">{contact.phone}</span>
                  </span>
                </a>
              </li>
            )}

            {whatsappHref && (
              <li>
                <a
                  href={`https://wa.me/${whatsappHref}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-start gap-3 rounded-xl border border-edge/80 bg-abyss/50 px-3.5 py-3 transition hover:border-signal/35 hover:bg-signal/[0.04]"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-ink-faint">
                      WhatsApp
                    </span>
                    <span className="mt-0.5 block text-sm text-ink">
                      {contact.phone ?? contact.whatsapp}
                    </span>
                  </span>
                </a>
              </li>
            )}

            {contact.office && (
              <li className="flex items-start gap-3 rounded-xl border border-edge/80 bg-abyss/50 px-3.5 py-3 sm:col-span-2 lg:col-span-1">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-ink-faint">
                    Office
                  </span>
                  <span className="mt-0.5 block text-sm text-ink">{contact.office}</span>
                </span>
              </li>
            )}

            {contact.hours && (
              <li className="flex items-start gap-3 rounded-xl border border-edge/80 bg-abyss/50 px-3.5 py-3 sm:col-span-2 lg:col-span-2">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-ink-faint">
                    Hours
                  </span>
                  <span className="mt-0.5 block text-sm text-ink">{contact.hours}</span>
                </span>
              </li>
            )}
          </ul>
        </section>
      )}

      <p className="pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[11px] leading-relaxed text-ink-faint">
        Checked every 5 minutes by GitHub Actions · results in{" "}
        <code className="text-ink-dim">
          {source.owner}/{source.name}
        </code>
        {" · "}
        configured in <code className="text-ink-dim">upsite.config.yaml</code>
      </p>
    </footer>
  );
}
