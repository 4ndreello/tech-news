import { useEffect } from 'react';
import { SEOMetadata, updateDocumentMeta } from '../utils/seo';

export function useSEO(metadata?: Partial<SEOMetadata>) {
  useEffect(() => {
    if (metadata) {
      updateDocumentMeta(metadata);
    }
  }, [metadata]);
}
