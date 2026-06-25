import VerifyEmail from '@/components/authentication/VerifyEmail'
import Loader from '@/components/ui/Loader'
import React from 'react'
import { Suspense } from 'react'
const Page = () => {
  return (
    <Suspense fallback={<Loader />}>
        <VerifyEmail />
    </Suspense>
  )
}

export default Page