"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { useOrderStore } from "@/store/order-store"
import {
  getCustomers,
  getCustomerAddresses,
  getPaymentTermsTemplates,
  ICustomer,
  ICustomerAddress,
  IPaymentTermsTemplate,
} from "@/app/actions/customer-action"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Custom hook for hydration-safe Zustand state
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

const CustomerSummery = () => {
  const isHydrated = useHydrated()

  const orderDetails = useOrderStore((state) => state.orderDetails)
  const validationErrors = useOrderStore((state) => state.validationErrors)
  const setCustomer = useOrderStore((state) => state.setCustomer)
  const setCustomerAddress = useOrderStore((state) => state.setCustomerAddress)
  const setDeliveryDate = useOrderStore((state) => state.setDeliveryDate)
  const setPaymentTerms = useOrderStore((state) => state.setPaymentTerms)
  const setCustomNote = useOrderStore((state) => state.setCustomNote)
  const setCustomFinalized = useOrderStore((state) => state.setCustomFinalized)

  // Data states
  const [customers, setCustomers] = useState<ICustomer[]>([])
  const [addresses, setAddresses] = useState<ICustomerAddress[]>([])
  const [paymentTerms, setPaymentTermsData] = useState<IPaymentTermsTemplate[]>([])

  // Loading states
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [loadingPaymentTerms, setLoadingPaymentTerms] = useState(true)

  // Dropdown open states
  const [customerOpen, setCustomerOpen] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)
  const [paymentTermsOpen, setPaymentTermsOpen] = useState(false)

  // Search states
  const [customerSearch, setCustomerSearch] = useState("")
  const [addressSearch, setAddressSearch] = useState("")

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true)
      const response = await getCustomers()
      if (response.success) {
        setCustomers(response.data)
      }
      setLoadingCustomers(false)
    }
    fetchCustomers()
  }, [])

  // Fetch payment terms on mount
  useEffect(() => {
    const fetchPaymentTerms = async () => {
      setLoadingPaymentTerms(true)
      const response = await getPaymentTermsTemplates()
      if (response.success) {
        setPaymentTermsData(response.data)
      }
      setLoadingPaymentTerms(false)
    }
    fetchPaymentTerms()
  }, [])

  // Fetch addresses when customer changes
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!orderDetails.customer) {
        setAddresses([])
        return
      }
      setLoadingAddresses(true)
      const response = await getCustomerAddresses(orderDetails.customer)
      if (response.success) {
        setAddresses(response.data)
      }
      setLoadingAddresses(false)
    }
    fetchAddresses()
  }, [orderDetails.customer])

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  // Filter addresses based on search
  const filteredAddresses = addresses.filter(
    (a) =>
      a.address_title.toLowerCase().includes(addressSearch.toLowerCase()) ||
      a.address_line1.toLowerCase().includes(addressSearch.toLowerCase()) ||
      a.city.toLowerCase().includes(addressSearch.toLowerCase())
  )

  const handleCustomerSelect = (customer: ICustomer) => {
    setCustomer(customer.name, customer.customer_name)
    setCustomerOpen(false)
    setCustomerSearch("")
  }

  const handleAddressSelect = (address: ICustomerAddress) => {
    const displayAddress = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.country,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ")
    setCustomerAddress(address.name, displayAddress)
    setAddressOpen(false)
    setAddressSearch("")
  }

  const handlePaymentTermsSelect = (term: IPaymentTermsTemplate) => {
    setPaymentTerms(term.name)
    setPaymentTermsOpen(false)
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  if (!isHydrated) {
    return (
      <div className="w-full p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full lg:px-4 px-0 lg:pt-0 pt-6 lg:pb-0 pb-35 space-y-4 border-t border-white/20 lg:border-t-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
          <User className="size-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Order Details</h2>
          <p className="text-xs text-white/60">Fill in customer information</p>
        </div>
      </div>

      {/* Customer Select */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <User className="size-3.5" />
          Customer
          {validationErrors.customer && (
            <span className="text-red-400 text-[10px] normal-case tracking-normal ml-auto">*Required</span>
          )}
        </label>
        <div className="relative">
          <button
            onClick={() => setCustomerOpen(!customerOpen)}
            className={cn(
              "w-full rounded-xl bg-white/10 border p-3 transition-all hover:bg-white/15 flex items-center justify-between text-left",
              validationErrors.customer
                ? "border-red-500 ring-1 ring-red-500/30"
                : "border-white/15"
            )}
          >
            <span
              className={cn(
                "text-sm",
                orderDetails.customer_name ? "text-white" : "text-white/40"
              )}
            >
              {orderDetails.customer_name || "Select customer..."}
            </span>
            {loadingCustomers ? (
              <Loader2 className="size-4 text-white/40 animate-spin" />
            ) : (
              <ChevronDown
                className={cn(
                  "size-4 text-white/40 transition-transform",
                  customerOpen && "rotate-180"
                )}
              />
            )}
          </button>

          {customerOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-xl bg-bg border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-white/10">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-sm text-white/40 text-center">
                    No customers found
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.name}
                      onClick={() => handleCustomerSelect(customer)}
                      className={cn(
                        "w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors flex flex-col",
                        orderDetails.customer === customer.name && "bg-white/5"
                      )}
                    >
                      <span className="text-sm text-white">
                        {customer.customer_name}
                      </span>
                      <span className="text-xs text-white/40">{customer.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Address Select */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          Delivery Address
          {validationErrors.customer_address && (
            <span className="text-red-400 text-[10px] normal-case tracking-normal ml-auto">*Required</span>
          )}
        </label>
        <div className="relative">
          <button
            onClick={() => orderDetails.customer && setAddressOpen(!addressOpen)}
            disabled={!orderDetails.customer}
            className={cn(
              "w-full rounded-xl bg-white/10 border p-3 transition-all flex items-center justify-between text-left",
              validationErrors.customer_address
                ? "border-red-500 ring-1 ring-red-500/30"
                : "border-white/15",
              orderDetails.customer
                ? "hover:bg-white/15"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "text-sm truncate pr-2",
                orderDetails.customer_address_display
                  ? "text-white"
                  : "text-white/40"
              )}
            >
              {orderDetails.customer_address_display ||
                (orderDetails.customer
                  ? "Select address..."
                  : "Select customer first")}
            </span>
            {loadingAddresses ? (
              <Loader2 className="size-4 text-white/40 animate-spin shrink-0" />
            ) : (
              <ChevronDown
                className={cn(
                  "size-4 text-white/40 transition-transform shrink-0",
                  addressOpen && "rotate-180"
                )}
              />
            )}
          </button>

          {addressOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-xl bg-bg border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-white/10">
                <input
                  type="text"
                  placeholder="Search addresses..."
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredAddresses.length === 0 ? (
                  <div className="p-3 text-sm text-white/40 text-center">
                    No addresses found
                  </div>
                ) : (
                  filteredAddresses.map((address) => (
                    <button
                      key={address.name}
                      onClick={() => handleAddressSelect(address)}
                      className={cn(
                        "w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors flex flex-col",
                        orderDetails.customer_address === address.name &&
                          "bg-white/5"
                      )}
                    >
                      <span className="text-sm text-white">
                        {address.address_title}
                      </span>
                      <span className="text-xs text-white/40 line-clamp-1">
                        {[
                          address.address_line1,
                          address.city,
                          address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Date */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          Delivery Date
          {validationErrors.delivery_date && (
            <span className="text-red-400 text-[10px] normal-case tracking-normal ml-auto">*Required</span>
          )}
        </label>
        <input
          type="date"
          value={orderDetails.delivery_date}
          onChange={(e) => setDeliveryDate(e.target.value)}
          min={getMinDate()}
          className={cn(
            "w-full rounded-xl bg-bg border p-3 text-sm text-white transition-all hover:bg-white/15 focus:outline-none focus:border-white/30 scheme-dark",
            validationErrors.delivery_date
              ? "border-red-500 ring-1 ring-red-500/30"
              : "border-white/15"
          )}
        />
      </div>

      {/* Payment Terms Select */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <CreditCard className="size-3.5" />
          Payment Terms
          {validationErrors.payment_terms_template && (
            <span className="text-red-400 text-[10px] normal-case tracking-normal ml-auto">*Required</span>
          )}
        </label>
        <div className="relative">
          <button
            onClick={() => setPaymentTermsOpen(!paymentTermsOpen)}
            className={cn(
              "w-full rounded-xl bg-white/10 border p-3 transition-all hover:bg-white/15 flex items-center justify-between text-left",
              validationErrors.payment_terms_template
                ? "border-red-500 ring-1 ring-red-500/30"
                : "border-white/15"
            )}
          >
            <span
              className={cn(
                "text-sm",
                orderDetails.payment_terms_template
                  ? "text-white"
                  : "text-white/40"
              )}
            >
              {orderDetails.payment_terms_template || "Select payment terms..."}
            </span>
            {loadingPaymentTerms ? (
              <Loader2 className="size-4 text-white/40 animate-spin" />
            ) : (
              <ChevronDown
                className={cn(
                  "size-4 text-white/40 transition-transform",
                  paymentTermsOpen && "rotate-180"
                )}
              />
            )}
          </button>

          {paymentTermsOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-xl bg-bg border border-white/20 shadow-2xl overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {paymentTerms.length === 0 ? (
                  <div className="p-3 text-sm text-white/40 text-center">
                    No payment terms found
                  </div>
                ) : (
                  paymentTerms.map((term) => (
                    <button
                      key={term.name}
                      onClick={() => handlePaymentTermsSelect(term)}
                      className={cn(
                        "w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors",
                        orderDetails.payment_terms_template === term.name &&
                          "bg-white/5"
                      )}
                    >
                      <span className="text-sm text-white">{term.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Note */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <FileText className="size-3.5" />
          Custom Note
        </label>
        <Textarea
          value={orderDetails.custom_note}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Add any special instructions or notes..."
          className="w-full rounded-xl bg-white/10 border border-white/15 p-3 text-sm text-white placeholder:text-white/40 transition-all hover:bg-white/15 focus:outline-none focus:border-white/30 min-h-20 resize-none"
        />
      </div>

      {/* Finalized Order Checkbox */}
      <div className="rounded-xl bg-white/10 border border-white/15 p-3 transition-all hover:bg-white/15">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setCustomFinalized(!orderDetails.custom_finalized)}
            className={cn(
              "size-5 rounded-md border-2 flex items-center justify-center transition-all",
              orderDetails.custom_finalized
                ? "bg-emerald-500 border-emerald-500"
                : "border-white/30 hover:border-white/50"
            )}
          >
            {orderDetails.custom_finalized && (
              <CheckCircle className="size-3.5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-white">
              Finalized Order
            </span>
            <p className="text-xs text-white/50 mt-0.5">
              Mark this order as finalized
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}

export default CustomerSummery
