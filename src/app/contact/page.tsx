import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { PageShell, AsideCard } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach GammaGrips support — a person replies within one working day.",
};

export default function ContactPage() {
  return (
    <PageShell
      title="Contact us"
      deck="A person reads every message and replies within one working day. If you are asking whether something fits, a photo of the bottom edge of your controller answers it fastest."
      crumbs={[{ label: "Contact" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <AsideCard title="Direct">
            <p>
              Support · <a href="mailto:support@gammagrips.com">support@gammagrips.com</a>
              <br />
              Returns · <a href="mailto:returns@gammagrips.com">returns@gammagrips.com</a>
              <br />
              Wholesale · <a href="mailto:trade@gammagrips.com">trade@gammagrips.com</a>
            </p>
            <p>Monday to Friday, 09:00–17:30 CET.</p>
          </AsideCard>
          <AsideCard title="GammaGrips B.V.">
            <p>
              Keileweg 22
              <br />
              3029 BS Rotterdam
              <br />
              Netherlands
            </p>
            <p>
              KvK 82910433
              <br />
              VAT NL862634891B01
            </p>
            <p>Returns are not accepted at this address without a label — email first.</p>
          </AsideCard>
        </div>
      }
    >
      <ContactForm />
    </PageShell>
  );
}
