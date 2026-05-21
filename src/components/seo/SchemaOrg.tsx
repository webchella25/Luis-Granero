// src/components/seo/SchemaOrg.tsx
// Server Component para Schema.org JSON-LD

interface SchemaOrgProps {
  schema: object | object[];
}

export default function SchemaOrg({ schema }: SchemaOrgProps) {
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