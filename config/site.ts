export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Stake Crash History",
  description: "A tool to view stake crash history data and gain insights.",
  navItems: [
    {
      label: "History",
      href: "/",
    },
    {
      label: "Cost-Profit",
      href: "/stake-cost-profit-calculator",
    },
    {
      label: "Merged",
      href: "/merged-stake-calculator",
    },
    {
      label: "Upload",
      href: "/update-headers",
    },
  ],
  navMenuItems: [
    {
      label: "Crash History",
      href: "/",
    },
    {
      label: "Cost Profit Calculator",
      href: "/stake-cost-profit-calculator",
    },
    {
      label: "Merged Calculator",
      href: "/merged-stake-calculator",
    },
    {
      label: "Upload Headers",
      href: "/update-headers",
    },
  ],
  links: {
    github: "https://github.com/ajay-develops",
    twitter: "https://x.com/ajay_develops",
    discord: "https://discord.gg/BgrPcPc89M",
    sponsor: "https://wa.me/+918696260393",
  },
};
