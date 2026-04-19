/**
 * projects.js — Project data
 * Add or edit entries here to update cards across the whole site.
 *
 * highlight: boolean - if true, project appears in the homepage highlights section
 * works:     boolean - if true (default), project appears on works.html page
 *            Set to false to hide a project from the works page while keeping it accessible via direct URL
 *
 * slides: array of { src, alt, caption? } objects for the case study hero slideshow.
 *         caption is optional — shown as an overlay when hovering the slideshow.
 *         Add as many or as few as you like — the slideshow builds itself.
 *         Leave the array empty ([]) to show a placeholder instead.
 *
 * accentColor: optional hex color string (e.g., "#FF5733") to override the default
 *              accent color for this project's case study page. If not set, the
 *              default accent color from CSS will be used.
 */

const projects = [
  {
    id:         "template",
    title:      "Template Case Study",
    caption:    "A comprehensive showcase of all gallery features including 5-column grid, landscape spanning, shadows, and captions.",
    discipline: "UI/UX Design",
    thumb:      "assets/images/placeholder/placeholder.png",
    url:        "works/template.html",
    highlight:  false,
    works:      false, // Doesn't show on works.html page
    overview: {
      role:     "Full-Stack Designer & Developer",
      timeline: "Ongoing Development",
      since:    "04/2026",
      teamSize: "1",
      platform: "Web (Responsive)",
      tools:    "HTML, CSS, JavaScript",
    },
    slides: [
      { src: "../assets/images/placeholder/placeholder-16-9-A.png", alt: "Template Slideshow A", caption: "Gallery Grid System Overview" },
      { src: "../assets/images/placeholder/placeholder-16-9-B.png", alt: "Template Slideshow B", caption: "Responsive Design Features" },
      { src: "../assets/images/placeholder/placeholder-A4-A.png", alt: "Template Slideshow C", caption: "A4 Format Integration" },
    ],
    gallery: [
      { src: "../assets/images/placeholder/placeholder-16-9-A.png", alt: "Landscape Example A", caption: "Landscape Image (2 Columns)", description: "Demonstrates how landscape images automatically span 2 columns in the 5-column grid" },
      { src: "../assets/images/placeholder/placeholder-A4-A.png", alt: "A4 Portrait Example A", caption: "A4 Portrait Layout", description: "Shows A4 portrait format in single column with proper aspect ratio" },
      { src: "../assets/images/placeholder/placeholder-A4-B.png", alt: "A4 Portrait Example B", caption: "Shadow Effects Demo", description: "Showcases the subtle shadow effects and hover animations on A4 format" },
      { src: "../assets/images/placeholder/placeholder-A4-A.png", alt: "A4 Portrait Example C", caption: "Caption Functionality", description: "Displays how captions appear below A4 images with proper styling" },
      { src: "../assets/images/placeholder/placeholder-A4-B.png", alt: "A4 Portrait Example D", caption: "Grid Alignment", description: "Shows how A4 images align properly within the grid system" },
      { src: "../assets/images/placeholder/placeholder-16-9-B.png", alt: "Landscape Example B", caption: "Responsive Layout Test", description: "Another landscape image demonstrating the 2-column span feature" },
      { src: "../assets/images/placeholder/placeholder-A4-A.png", alt: "A4 Portrait Example E", caption: "Mobile Responsiveness", description: "Tests how A4 format adapts to smaller screen sizes" },
      { src: "../assets/images/placeholder/placeholder-A4-B.png", alt: "A4 Portrait Example F", caption: "Rounded Corners", description: "Showcases the 12px border-radius applied to A4 images" },
      { src: "../assets/images/placeholder/placeholder-16-9-A.png", alt: "Landscape Example C", caption: "Hover Interactions", description: "Demonstrates the lift effect and enhanced shadows on hover" },
      { src: "../assets/images/placeholder/placeholder-A4-A.png", alt: "A4 Portrait Example G", caption: "Lightbox Integration", description: "Final A4 image showing lightbox trigger functionality" },
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
    works:      true,
    accentColor: "#FF8D53",
    overview: {
      role:     "UI/UX Designer",
      timeline: "2 months",
      since:    "09/2025",
      teamSize: "3",
      platform: "Mobile (iOS)",
      tools:    "Figma, Procreate (For Low-Fi), Notion",
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
  {
    id:         "artmax",
    title:      "ArtMax",
    caption:    "A minimalistic mentorship hub where artists learn, share portfolios, and discover events.",
    discipline: "UI/UX Design",
    thumb:      "assets/images/artmax/thumb.png",
    url:        "works/artmax.html",
    highlight:  true,
    works:      true,
    accentColor: "#9563F9",
    overview: {
      role:     "Lead UI/UX Designer (Concept Developer, Low & High‑Fidelity UI, Prototyping)",
      timeline: "3 weeks",
      since:    "10/2024",
      teamSize: "5",
      platform: "Mobile (iOS & Android)",
      tools:    "Figma, Goodnotes 5 (For Low-Fi)",
    },
    slides: [
      { src: "../assets/images/artmax/thumb.png", alt: "ArtMax Thumbnail", caption: "ArtMax, a minimalistic mentorship hub." },
    ],
    gallery: [
      { src: "../assets/images/artmax/ui/welcome.png", alt: "ArtMax Welcome Page", caption: "Welcome Screen", description: "Welcome page for new users." },
      { src: "../assets/images/artmax/ui/main.png", alt: "ArtMax Main Page", caption: "Main Dashboard", description: "Central hub for discovering content and mentors." },
      { src: "../assets/images/artmax/ui/article2.png", alt: "ArtMax Article Page", caption: "Article/Post View", description: "Reading experience for educational content or upcoming events." },
      { src: "../assets/images/artmax/ui/mentoring.png", alt: "ArtMax Mentoring Page", caption: "Mentoring Hub", description: "Browsing various lessons, connecting with experienced artists and mentors" },
      { src: "../assets/images/artmax/ui/lesson.png", alt: "ArtMax Lesson Page", caption: "Lesson Page", description: "Looking for details of your interested lesson." },
      { src: "../assets/images/artmax/ui/mentor.png", alt: "ArtMax Mentor Page", caption: "Mentor Profile", description: "Detailed mentor information and booking interface." },
      { src: "../assets/images/artmax/thumb.png", alt: "ArtMax Thumbnail", caption: "ArtMax Thumbnail", description: "ArtMax Thumbnail"},
    ],
  },
];
