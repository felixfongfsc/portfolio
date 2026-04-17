/**
 * projects.js — Project data
 * Add or edit entries here to update cards across the whole site.
 *
 * slides: array of { src, alt, caption? } objects for the case study hero slideshow.
 *         caption is optional — shown as an overlay when hovering the slideshow.
 *         Add as many or as few as you like — the slideshow builds itself.
 *         Leave the array empty ([]) to show a placeholder instead.
 */

const projects = [
  {
    id:         "artmax",
    title:      "ArtMax",
    caption:    "A minimalistic mentorship hub where artists learn, share portfolios, and discover events.",
    discipline: "UI/UX Design",
    thumb:      "assets/images/artmax/thumb.png",
    url:        "works/artmax.html",
    highlight:  true,
    overview: {
      role:     "Lead UI/UX Designer",
      timeline: "3 months",
      teamSize: "1",
      platform: "Mobile (iOS & Android)",
    },
    slides: [
      { src: "../assets/images/_placeholder_16_9_A.png", alt: "ArtMax Placeholder A", caption: "ArtMax Placeholder A" },
      { src: "../assets/images/_placeholder_16_9_B.png", alt: "ArtMax Placeholder B", caption: "ArtMax Placeholder B" },
    ],
    gallery: [
      { src: "../assets/images/artmax/welcome.png", alt: "ArtMax Welcome Page" },
      { src: "../assets/images/artmax/main.png", alt: "ArtMax Main Page" },
      { src: "../assets/images/artmax/article2.png", alt: "ArtMax Article Page" },
      { src: "../assets/images/artmax/mentoring.png", alt: "ArtMax Mentoring Page" },
      { src: "../assets/images/artmax/lesson.png", alt: "ArtMax Lesson Page" },
      { src: "../assets/images/artmax/mentor.png", alt: "ArtMax Mentor Page" },
      { src: "../assets/images/artmax/thumb.png", alt: "ArtMax Thumbnail" },
    ],
  },
  {
    id:         "saushun",
    title:      "SauShun",
    caption:    "An e-commerce app that solves cross-border proxy purchasing problems for overseas shoppers.",
    discipline: "UI/UX Design",
    thumb:      "assets/images/saushun/thumb.png",
    url:        "works/saushun.html",
    highlight:  true,
    overview: {
      role:     "UI/UX Designer",
      timeline: "2 months",
      teamSize: "3",
      platform: "Mobile (iOS)",
    },
    slides: [
      // { src: "../assets/images/saushun/screen-01.jpg", alt: "SauShun agent marketplace", caption: "Agent marketplace" },
      // { src: "../assets/images/saushun/screen-02.jpg", alt: "SauShun order tracking", caption: "Real-time order tracking" },
    ],
    gallery: [
      // { src: "../assets/images/saushun/gallery-01.jpg", alt: "SauShun agent marketplace" },
      // { src: "../assets/images/saushun/gallery-02.jpg", alt: "SauShun order tracking" },
    ],
  },
];
