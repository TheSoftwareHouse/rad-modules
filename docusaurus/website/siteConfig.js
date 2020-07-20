const siteConfig = {
  title: "RAD Modules",
  tagline: "RAD modules description.",
  ogImage: "img/undraw_online.svg",
  url: "https://thesoftwarehouse.github.io",
  baseUrl: "/rad-modules-docs/",
  projectName: "rad-modules-docs",
  organizationName: "TheSoftwareHouse",

  headerLinks: [{ search: true }, { href: "https://github.com/TheSoftwareHouse/rad-modules", label: "GitHub" }],

  headerIcon: "img/favicon.ico",
  footerIcon: "img/favicon.ico",
  favicon: "img/favicon.ico",

  colors: {
    primaryColor: "#2F1666",
    secondaryColor: "#7731F6",
  },

  copyright: `Copyright © ${new Date().getFullYear()} The Software House`,

  highlight: {
    theme: "atom-one-dark",
  },
  scripts: ["https://buttons.github.io/buttons.js"],
  onPageNav: "separate",
  cleanUrl: true,
};

module.exports = siteConfig;
