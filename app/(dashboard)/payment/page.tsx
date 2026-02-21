"use client"

import { useEffect, useState, useCallback } from "react"
import { usePaymentStore } from "@/store/payment-store"
import { getCustomers, getCustomerAddresses, ICustomer, ICustomerAddress } from "@/app/actions/customer-action"
import {
  getPaymentModes,
  getPaidToAccount,
  getCustomerBalance,
  createPaymentEntry,
  IModeOfPayment,
} from "@/app/actions/payment-action"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Wallet,
  User,
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  ChevronDown,
  Search,
  FileText,
  Loader2,
} from "lucide-react"

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "KITCHEN CARE AGRO FOOD PRODUCTS (M) SDN BHD"

const PaymentPage = () => {
  // Data states
  const [customers, setCustomers] = useState<ICustomer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<ICustomer[]>([])
  const [addresses, setAddresses] = useState<ICustomerAddress[]>([])
  const [paymentModes, setPaymentModes] = useState<IModeOfPayment[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Dropdown states
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false)
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")

  // Payment store
  const {
    customer,
    customerName,
    customerAddress,
    addressDisplay,
    postingDate,
    amount,
    modeOfPayment,
    customerBalance,
    paidToAccount,
    referenceNo,
    referenceDate,
    isSubmitting,
    setCustomer,
    setCustomerAddress,
    setPostingDate,
    setAmount,
    setModeOfPayment,
    setCustomerBalance,
    setPaidToAccount,
    setReferenceNo,
    setReferenceDate,
    setIsSubmitting,
    clearPayment,
  } = usePaymentStore()

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        const [customersRes, modesRes] = await Promise.all([
          getCustomers(),
          getPaymentModes(),
        ])

        if (customersRes.success) {
          setCustomers(customersRes.data)
          setFilteredCustomers(customersRes.data)
        }

        if (modesRes.success) {
          setPaymentModes(modesRes.data)
        }
      } catch {
        toast.error("Failed to load data")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter((c) =>
        c.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [customerSearch, customers])

  // Load addresses when customer changes
  const handleCustomerSelect = useCallback(
    async (selectedCustomer: ICustomer) => {
      setCustomer(selectedCustomer.name, selectedCustomer.customer_name)
      setCustomerDropdownOpen(false)
      setCustomerSearch("")

      // Fetch addresses
      const addressRes = await getCustomerAddresses(selectedCustomer.name)
      if (addressRes.success) {
        setAddresses(addressRes.data)
      }

      // Fetch customer balance
      const balanceRes = await getCustomerBalance(selectedCustomer.name)
      if (balanceRes.success && balanceRes.data !== null) {
        setCustomerBalance(balanceRes.data)
      }
    },
    [setCustomer, setCustomerBalance]
  )

  // Handle address select
  const handleAddressSelect = useCallback(
    (address: ICustomerAddress) => {
      const display = [
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.country,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", ")

      setCustomerAddress(address.name, display)
      setAddressDropdownOpen(false)
    },
    [setCustomerAddress]
  )

  // Handle mode of payment select
  const handleModeSelect = useCallback(
    async (mode: string) => {
      setModeOfPayment(mode)
      setModeDropdownOpen(false)

      // Fetch paid to account
      const accountRes = await getPaidToAccount(mode, COMPANY_NAME)
      if (accountRes.success && accountRes.data) {
        setPaidToAccount(accountRes.data.account)
      }
    },
    [setModeOfPayment, setPaidToAccount]
  )

  // Submit payment
  const handleSubmit = async () => {
    if (!customer || !postingDate || !amount || !customerAddress || !modeOfPayment) {
      toast.error("Please fill in all required fields")
      return
    }

    if (modeOfPayment === "Cheque" && (!referenceNo || !referenceDate)) {
      toast.error("Please enter cheque/reference number and date")
      return
    }

    if (!paidToAccount) {
      toast.error("Paid To account could not be determined for this mode of payment")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createPaymentEntry({
        customer,
        customerName,
        postingDate,
        amount: parseFloat(amount),
        modeOfPayment,
        customerAddress,
        paidToAccount,
        referenceNo: modeOfPayment === "Cheque" ? referenceNo : undefined,
        referenceDate: modeOfPayment === "Cheque" ? referenceDate : undefined,
      })

      if (response.success) {
        toast.success(`Payment Entry Created: ${response.data?.name}`)
        clearPayment()
        setAddresses([])
      } else {
        toast.error(response.message || "Failed to create payment entry")
      }
    } catch {
      toast.error("Failed to create payment entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          <Wallet className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Payment Entry</h1>
          <p className="text-sm text-white/70">Create a new payment entry</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Customer Select */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
              <User className="size-3" />
              Customer Name
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-white flex items-center justify-between focus:outline-none focus:border-white/30 transition-colors"
              >
                <span className={customerName ? "text-white" : "text-white/40"}>
                  {customerName || "Select customer..."}
                </span>
                <ChevronDown className="size-4 text-white/50" />
              </button>
              {customerDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl max-h-64 overflow-hidden">
                  <div className="p-2 border-b border-white/10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search customer..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCustomerSelect(c)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                        >
                          {c.customer_name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-white/50 text-sm">No results found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
              <Calendar className="size-3" />
              Date
            </label>
            <input
              type="date"
              value={postingDate}
              onChange={(e) => setPostingDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
              <DollarSign className="size-3" />
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Mode of Payment */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
              <CreditCard className="size-3" />
              Mode of Payment
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-white flex items-center justify-between focus:outline-none focus:border-white/30 transition-colors"
              >
                <span className={modeOfPayment ? "text-white" : "text-white/40"}>
                  {modeOfPayment || "Select mode..."}
                </span>
                <ChevronDown className="size-4 text-white/50" />
              </button>
              {modeDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {paymentModes.map((mode) => (
                    <button
                      key={mode.name}
                      type="button"
                      onClick={() => handleModeSelect(mode.name)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cheque Fields */}
          {modeOfPayment === "Cheque" && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
                  <FileText className="size-3" />
                  Cheque/Reference No
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
                  <Calendar className="size-3" />
                  Cheque/Reference Date
                </label>
                <input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Customer Address */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
              <MapPin className="size-3" />
              Customer Address
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAddressDropdownOpen(!addressDropdownOpen)}
                disabled={!customer}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-white flex items-center justify-between focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
              >
                <span className={customerAddress ? "text-white" : "text-white/40"}>
                  {customerAddress || "Select address..."}
                </span>
                <ChevronDown className="size-4 text-white/50" />
              </button>
              {addressDropdownOpen && addresses.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {addresses.map((addr) => (
                    <button
                      key={addr.name}
                      type="button"
                      onClick={() => handleAddressSelect(addr)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                    >
                      {addr.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Address Display */}
          <div className="min-h-[120px] p-4 rounded-xl bg-white/5 border border-white/10">
            {addressDisplay ? (
              <p className="text-white/70 text-sm whitespace-pre-wrap">{addressDisplay}</p>
            ) : (
              <p className="text-white/40 text-sm">Address details will appear here</p>
            )}
          </div>

          {/* Customer Balance */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Customer Due</p>
            <p className="text-2xl font-semibold text-white">
              {customerBalance !== null ? customerBalance.toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:h-0 h-20"></div>

      {/* Submit Button */}
      <div className="lg:relative fixed bottom-0 left-0 right-0 p-4 lg:p-0 bg-white/10 to-transparent lg:from-transparent lg:bg-none py-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-xl p-4 font-medium text-sm transition-all flex items-center justify-center gap-2",
            isSubmitting
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="size-4" />
              Submit Payment
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default PaymentPage
