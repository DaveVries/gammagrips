import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: 'Cookies',
  description: 'The two things we store in your browser, and why.',
};

export default function Page() {
  return (
    <PageShell
      title={'Cookies'}
      deck={'The two things we store in your browser, and why.'}
      crumbs={[{ label: 'Cookies' }]}
    >
      <h2>The short version</h2>
      <p>
        We do not use tracking cookies and there is no consent banner on this
        site, because there is nothing to consent to. Two items are stored in your
        browser, both strictly necessary, neither shared with anyone.
      </p>

      <h2>What is stored</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Lifetime</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>gg.cart.v1</td>
            <td>localStorage</td>
            <td>Keeps your cart between visits</td>
            <td>Until cleared</td>
          </tr>
          <tr>
            <td>gg.session</td>
            <td>Cookie</td>
            <td>Keeps you signed in, if you have an account</td>
            <td>30 days</td>
          </tr>
        </tbody>
      </table>

      <h2>Analytics</h2>
      <p>
        Our analytics is cookieless and stores nothing in your browser. It counts
        page views and referrers in aggregate and cannot identify you or follow
        you to another site.
      </p>

      <h2>Clearing them</h2>
      <p>
        Clearing site data for gammagrips.com removes both. Your cart will be
        empty afterwards; nothing else is affected.
      </p>
    </PageShell>
  );
}
