import React from 'react';
import { Source } from '../types';
import HackerNewsIcon from './icons/HackerNewsIcon';
import TabNewsIcon from './icons/TabNewsIcon';
import DevToIcon from './icons/DevToIcon';
import LobstersIcon from './icons/LobstersIcon';
import TwitterIcon from './icons/TwitterIcon';

interface SourceIconProps {
  source: Source;
  size?: number;
  className?: string;
}

export default function SourceIcon({ source, size = 16, className = '' }: SourceIconProps) {
  switch (source) {
    case Source.HackerNews:
      return <HackerNewsIcon size={size} className={className} />;
    case Source.TabNews:
      return <TabNewsIcon size={size} className={className} />;
    case Source.DevTo:
      return <DevToIcon size={size} className={className} />;
    case Source.Lobsters:
      return <LobstersIcon size={size} className={className} />;
    case Source.Twitter:
      return <TwitterIcon size={size} className={className} />;
    default:
      return null;
  }
}
