import React from 'react';
import { Input, Button } from '../../ui';

export const ContentUpload = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle content upload will go here
    console.log('Uploading content...');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Title" type="text" />
      <Input label="ISRC" type="text" />
      <Input label="Audio File" type="file" />
      <Button variant="primary" size="md" type="submit">
        Upload
      </Button>
    </form>
  );
};
