export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ZAU Perfumes",
    "description": "Luxury fragrances and premium cologne collection",
    "url": "https://zauperfumes.com",
    "logo": "https://zauperfumes.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "sameAs": [],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://zauperfumes.com/products?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
