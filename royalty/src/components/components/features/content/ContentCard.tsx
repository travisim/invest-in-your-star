import React from 'react';
import { Card } from '../../ui';

interface ContentCardProps {
  title: string;
  artist: string;
  // Add more props as needed
}

export const ContentCard = ({ title, artist }: ContentCardProps) => {
  return (
    <Card>
      <h3>{title}</h3>
      <p>{artist}</p>
    </Card>
  );
};
