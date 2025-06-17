import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Stake Cost Profit Calculator",
    template: `%s - Stake Cost Profit Calculator`,
  },
};

const Layout = ({ children }: any) => {
  return <div>{children}</div>;
};

export default Layout;
