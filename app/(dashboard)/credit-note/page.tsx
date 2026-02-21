"use client"

import {
  CreditNoteCustomerInfo,
  CreditNoteItemsTable,
  CreditNoteSubmitButton,
} from "@/components/credit-note"

const CreditNotePage = () => {
  return (
    <div className="flex items-start lg:flex-row flex-col-reverse lg:divide-x h-full lg:gap-0 gap-6 divide-white/20">
      {/* Left Column - Customer Info */}
      <div className="lg:w-1/2 w-full lg:pr-4 pr-0">
        <CreditNoteCustomerInfo />
        <div className="mt-6">
          <CreditNoteSubmitButton />
        </div>
      </div>

      {/* Right Column - Items */}
      <div className="lg:w-1/2 w-full lg:pl-4 pl-0">
        <CreditNoteItemsTable />
      </div>
    </div>
  )
}

export default CreditNotePage
