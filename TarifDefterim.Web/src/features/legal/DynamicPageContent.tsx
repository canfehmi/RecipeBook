import { useQuery } from '@tanstack/react-query';
import { getPageContent } from '../../api/pageContent';
import { LegalPageLayout } from './LegalPageLayout';

interface DynamicPageContentProps {
  slug: string;
  fallbackTitle: string;
}

export function DynamicPageContent({ slug, fallbackTitle }: DynamicPageContentProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['page-content', slug],
    queryFn: () => getPageContent(slug),
  });

  if (isLoading) {
    return (
      <LegalPageLayout title={fallbackTitle}>
        <p className="text-muted">Yükleniyor...</p>
      </LegalPageLayout>
    );
  }

  if (isError || !data) {
    return (
      <LegalPageLayout title={fallbackTitle}>
        <p className="text-red-600">Sayfa içeriği yüklenirken bir hata oluştu.</p>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout title={data.title}>
      <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
    </LegalPageLayout>
  );
}
