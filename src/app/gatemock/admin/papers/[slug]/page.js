import MockAdmin from '@/components/mock/MockAdmin';

export const metadata = { title: 'Previous-year paper review · G4Gate Admin' };
export default async function Page({ params }) {
  const { slug } = await params;
  return <MockAdmin paperSlug={slug} />;
}
