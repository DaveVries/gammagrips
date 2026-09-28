import type { Guide } from "@/lib/types";

export const GUIDES: Guide[] = [
  {
    slug: "choosing-a-controller-grip",
    title: "How to choose a controller grip",
    deck: "Two questions, and one of them is just which controller you own.",
    category: "Buying",
    readMinutes: 3,
    date: "2026-09-28",
    body: [
      {
        paragraphs: [
          "This guide used to run to four questions about sweat, session length and joint pain, and answered each with a different surface. We make one surface, so most of that was a decision tree with one destination. Here is the honest version.",
        ],
      },
      {
        heading: "1. Which controller do you own?",
        paragraphs: [
          "This is the only question that can be answered wrong. Each shell is moulded to one controller and they are not interchangeable — a DualSense shell will not seat on a DualSense Edge, and an Xbox Wireless shell will not seat on an Elite Series 2.",
          "If you are not sure which revision you have, the compatibility checker identifies it from the bottom edge of the controller in two questions.",
        ],
      },
      {
        heading: "2. Which one do you want to look at?",
        paragraphs: [
          "There is one mould and one surface, so all six colourways grip identically. Nothing about Venom is grippier than Glacier; they are the same shell in a different colour.",
          "Glacier is the quietest and changes the look of the controller least. Venom is the loudest and holds up best under a streaming light. The other four sit between them.",
        ],
      },
      {
        heading: "What we cannot tell you yet",
        paragraphs: [
          "How much thickness the shell adds, what it weighs and how hard the compound is. The first production run is still being moulded and none of it has been measured. Those numbers go on the product pages the day we have them, and not before.",
        ],
      },
    ],
  },
  {
    slug: "dualsense-grip-installation",
    title: "Fitting grips to a DualSense",
    deck: "Two minutes, no tools, no adhesive. The one step people skip is the one that matters.",
    category: "Installation",
    readMinutes: 3,
    date: "2026-07-18",
    body: [
      {
        paragraphs: [
          "Our grips are friction-fit moulded shells. There is no adhesive, nothing is permanent, and you can take them off and refit them as many times as you like without marking the controller.",
        ],
      },
      {
        heading: "Before you start",
        paragraphs: [
          "Clean the handles. This is the step everyone skips and it is the reason grips work loose. Skin oil on the controller shell acts as a lubricant between the plastic and the TPU. Wipe both handles with the microfibre cloth in the box — or any cloth with a little isopropyl alcohol — and let them dry for thirty seconds.",
        ],
      },
      {
        heading: "Fitting",
        paragraphs: ["The grips are handed. The left shell has the deeper cut-out for the USB-C port side of the bottom edge."],
        list: [
          "Start at the bottom of the handle, not the top. Hook the lower lip of the shell over the base of the grip.",
          "Roll the shell upward with your thumbs, keeping the edge seated as you go. Do not stretch it over the top first.",
          "Seat the top edge last, working it under the shoulder of the handle until it sits flush.",
          "Run a thumbnail around the whole perimeter. If any edge stands proud, lift it and re-seat that section.",
        ],
      },
      {
        heading: "Check these four things",
        paragraphs: ["Before you play, confirm all four. If any of them fails, the shell is not fully seated."],
        list: [
          "The USB-C port is completely unobstructed",
          "Both triggers travel their full range without contacting the shell",
          "The headphone jack accepts a plug fully",
          "Neither grip rotates when you twist it firmly",
        ],
      },
      {
        heading: "Removal",
        paragraphs: [
          "Work a fingernail under the top edge and peel downward. Never pull from the middle of the shell — you will stretch the TPU and it will not sit as tightly when you refit it.",
        ],
      },
      {
        heading: "If a grip works loose",
        paragraphs: [
          "Nine times out of ten it is oil on the controller, not a faulty shell. Take the grip off, clean both the controller handle and the inside of the shell with warm water and washing-up liquid, dry both completely, and refit. If it still lifts at the same edge after that, it is a moulding fault — email support with your order number and we will replace it.",
        ],
      },
    ],
  },
  {
    slug: "will-these-fit-my-controller",
    title: "Will these fit my controller?",
    deck: "Exactly which controllers we support, which we do not, and the three revisions that catch people out.",
    category: "Compatibility",
    readMinutes: 3,
    date: "2026-05-20",
    body: [
      {
        paragraphs: [
          "Our grips are moulded per controller. They are not universal stretch sleeves, which is why they fit precisely — and why buying the wrong one means it will not fit at all.",
        ],
      },
      {
        heading: "Supported",
        paragraphs: ["Every grip in the range is made in all four of these shell moulds."],
        list: [
          "DualSense Wireless Controller — all revisions, including the 2023 refresh",
          "DualSense Edge Wireless Controller — cut around the rear paddle module",
          "Xbox Wireless Controller — Series X|S, and the Xbox One 2016 refresh with the 3.5 mm jack",
          "Xbox Elite Wireless Controller Series 2 — including Core",
        ],
      },
      {
        heading: "Not supported",
        paragraphs: [
          "These will not fit and we do not sell a grip for them. If you order for the wrong controller, our 60-day return window covers the mistake.",
        ],
        list: [
          "DualShock 4 — different handle geometry",
          "Xbox One controllers from before the 2016 refresh (no 3.5 mm jack)",
          "Nintendo Switch Pro Controller and Joy-Con",
          "Third-party controllers, including Victrix, Nacon and 8BitDo",
        ],
      },
      {
        heading: "Three things that catch people out",
        paragraphs: [],
        list: [
          "DualSense vs DualSense Edge are different moulds. The Edge has a rear paddle module and our Edge grips are cut around it. Standard DualSense grips will not seat on an Edge.",
          "Xbox Wireless vs Elite Series 2 are different moulds. The Elite has a deeper, more sculpted handle. They are not interchangeable in either direction.",
          "The 2016 Xbox One refresh does fit our Xbox Wireless grips. Earlier Xbox One controllers do not. If your controller has a 3.5 mm headphone jack in the bottom edge, it is the 2016 revision and it will fit.",
        ],
      },
      {
        heading: "Still not sure",
        paragraphs: [
          "Use the compatibility checker, or email support with a photo of the bottom edge of your controller and we will tell you which mould you need before you order.",
        ],
      },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
