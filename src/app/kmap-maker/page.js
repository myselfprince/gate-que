import KMapStudio from '@/components/kmap/KMapStudio';

export const metadata = { title: 'K-Map Studio · G4Gate', description: 'Paint and group 2–6 variable Karnaugh maps, simplify SOP/POS logic, and export SVG, PNG, LaTeX and truth tables.' };
export default function KMapPage() { return <KMapStudio/>; }
