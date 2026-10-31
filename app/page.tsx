import { SiteHeader } from "@/components/site-header";
import { LandingPage } from "@/components/landing-page";
import { getPublicProduct } from "@/lib/products";

export const revalidate = 60;

export default async function Home() {
  const product = await getPublicProduct();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Към съдържанието
      </a>
      <SiteHeader />
      <div id="main-content">
        <LandingPage product={product} />
      </div>
    </>
  );
}
