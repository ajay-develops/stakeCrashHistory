import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type MultiplayerCrash = {
  crashpoint: number;
  hash: {
    id: string;
    hash: string;
    __typename: string;
  };
  id: string;
  startTime: string;
  __typename: string;
};
