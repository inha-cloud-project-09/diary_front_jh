import { Suspense } from "react"

import Component from "./diary-detail"

export default function DiaryDetailPage() {
  return (
    <Suspense>
      <Component />
    </Suspense>
  )
}
