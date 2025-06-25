import { Suspense } from 'react'
import GeneralForm from './GeneralForm'

export default function GeneralIntakePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeneralForm />
    </Suspense>
  )
}
