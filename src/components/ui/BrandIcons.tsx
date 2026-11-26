import React from 'react';
import { GithubLogo, LinkedinLogo, type IconProps } from '@phosphor-icons/react';

/** Brand marks come from the same Phosphor set as every other icon, so weight and size match. */
export const GithubIcon = (props: IconProps) => <GithubLogo aria-hidden {...props} />;
export const LinkedinIcon = (props: IconProps) => <LinkedinLogo aria-hidden {...props} />;

/* Personal "B" mark, drawn in the current text colour (monochrome to fit the blueprint system). */
const LOGO_TOP =
  'M484 335H785C855 335 912 385 912 445C912 492 878 525 815 545C700 578 530 615 478 710V665C478 590 560 520 790 483C810 480 822 465 822 445C822 428 805 415 780 415H579V517C540 535 505 560 484 590Z';
const LOGO_BOTTOM =
  'M478 755H815C885 755 943 705 943 640C943 590 908 553 862 540C810 560 755 576 700 592H800C825 592 845 610 845 632C845 655 825 670 800 670H562C530 692 500 722 478 755Z';

export const Logo = ({ title = 'Mohammed Belouarraq', ...props }: React.SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg viewBox="470 327 481 436" role="img" aria-label={title} {...props}>
    <path d={LOGO_TOP} fill="currentColor" />
    <path d={LOGO_BOTTOM} fill="rgb(var(--accent))" />
  </svg>
);
