import type { Metadata } from 'next'
import { CategoriesPage } from '@/components/lifeos/categories-page'

export const metadata: Metadata = { title: 'Categories — LifeOS AI' }

export default function Page() {
  return <CategoriesPage />
}
