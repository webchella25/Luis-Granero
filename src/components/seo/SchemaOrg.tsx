// src/components/seo/SchemaOrg.tsx - NUEVO
'use client';

import { useEffect } from 'react';

interface SchemaOrgProps {
  schema: object | object[];
}

export default function SchemaOrg({ schema }: SchemaOrgProps) {
  useEffect(() => {
    // El schema se inyecta en el head automáticamente al renderizar
  }, [schema]);

  const schemas = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {schemas.map((s, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}