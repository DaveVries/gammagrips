import { COLLECTIONS, PLATFORMS, PRODUCTS, TEXTURES } from "@/data/catalog";

export interface NavLink {
  label: string;
  href: string;
  note?: string;
}

export interface NavColumn {
  heading: string;
  /** Category headers are links, not inert labels — users expect to click them
      to browse the broad scope before narrowing. */
  headingHref?: string;
  links: NavLink[];
}

export interface NavItem {
  label: string;
  href: string;
  panel?: {
    columns: NavColumn[];
    feature?: { title: string; copy: string; href: string; cta: string; designId: string };
  };
}

const gripLinks = PRODUCTS.map((p) => ({
  label: p.name.replace(" Grips", ""),
  href: `/products/${p.slug}`,
  note: p.tagline,
}));

const platformLinks = (family: "playstation" | "xbox") =>
  PLATFORMS.filter((p) => p.family === family).map((p) => ({
    label: p.short,
    href: `/${family}?platform=${p.id}`,
    note: p.console,
  }));

export const NAV: NavItem[] = [
  {
    label: "Grips",
    href: "/controller-grips",
    panel: {
      columns: [
        {
          heading: "All six grips",
          headingHref: "/controller-grips",
          links: gripLinks,
        },
        {
          heading: "By surface",
          headingHref: "/guides/grip-texture-comparison",
          links: TEXTURES.map((t) => ({
            label: t.name,
            href: `/controller-grips?texture=${t.id}`,
            note: `${t.profile} · grip ${t.grip}/5`,
          })),
        },
        {
          heading: "By controller",
          headingHref: "/controller-grips",
          links: PLATFORMS.map((p) => ({
            label: p.short,
            href: `/controller-grips?platform=${p.id}`,
            note: p.console,
          })),
        },
      ],
      feature: {
        title: "Not sure which surface?",
        copy: "Three questions on how your hands behave, and we name the grip.",
        href: "/customize",
        cta: "Open the configurator",
        designId: "dark-matter",
      },
    },
  },
  {
    label: "PlayStation",
    href: "/playstation",
    panel: {
      columns: [
        { heading: "Controllers", headingHref: "/playstation", links: platformLinks("playstation") },
        { heading: "Grips", headingHref: "/playstation", links: gripLinks.slice(0, 6) },
        {
          heading: "Help",
          links: [
            { label: "Will these fit?", href: "/compatibility" },
            { label: "Fitting a DualSense", href: "/guides/dualsense-grip-installation" },
            { label: "Choosing a surface", href: "/guides/grip-texture-comparison" },
          ],
        },
      ],
      feature: {
        title: "Cut for the Edge module",
        copy: "DualSense Edge shells clear the rear paddles — stick modules still swap out.",
        href: "/playstation?platform=dualsense-edge",
        cta: "Shop DualSense Edge",
        designId: "vapor",
      },
    },
  },
  {
    label: "Xbox",
    href: "/xbox",
    panel: {
      columns: [
        { heading: "Controllers", headingHref: "/xbox", links: platformLinks("xbox") },
        { heading: "Grips", headingHref: "/xbox", links: gripLinks.slice(0, 6) },
        {
          heading: "Help",
          links: [
            { label: "Will these fit?", href: "/compatibility" },
            { label: "Elite Series 2 notes", href: "/guides/will-these-fit-my-controller" },
            { label: "Choosing a surface", href: "/guides/grip-texture-comparison" },
          ],
        },
      ],
      feature: {
        title: "Elite Series 2 is its own mould",
        copy: "Deeper handle, different tooling. Xbox Wireless shells will not seat on it.",
        href: "/xbox?platform=xbox-elite-2",
        cta: "Shop Elite Series 2",
        designId: "volt",
      },
    },
  },
  {
    label: "Designs",
    href: "/collections",
    panel: {
      columns: [
        {
          heading: "Collections",
          headingHref: "/collections",
          links: COLLECTIONS.map((c) => ({
            label: c.name,
            href: `/collections/${c.id}`,
            note: c.tagline,
          })),
        },
        { heading: "Designs", headingHref: "/collections", links: gripLinks },
      ],
      feature: {
        title: "Ember",
        copy: "Dark Matter's drainage with the colourway inverted — the web is the graphic.",
        href: "/products/ember-grips",
        cta: "View Ember",
        designId: "ember",
      },
    },
  },
  {
    label: "Guides",
    href: "/guides",
  },
];
