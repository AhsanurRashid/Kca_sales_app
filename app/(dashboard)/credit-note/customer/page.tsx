"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCreditNoteStore } from "@/store/credit-note-store"
import {
  getCustomers,
  getCustomerAddresses,
  ICustomer,
  ICustomerAddress,
} from "@/app/actions/customer-action"
import { Button } from "@/components/ui/button"
import {
  User,
  MapPin,
  ArrowLeft,
  ChevronDown,
  Loader2,
  FileText,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function CreditNoteCustomerPage() {
  const router = useRouter()
  const { creditNoteDetails, setCustomer, setCustomerAddress, setReturnAgainst } =
    useCreditNoteStore()

  // Data states
  const [customers, setCustomers] = useState<ICustomer[]>([])
  const [addresses, setAddresses] = useState<ICustomerAddress[]>([])

  // Loading states
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  // Dropdown open states
  const [customerOpen, setCustomerOpen] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)

  // Search states
  const [customerSearch, setCustomerSearch] = useState("")
  const [addressSearch, setAddressSearch] = useState("")

  // Selection states
  const [selectedCustomer, setSelectedCustomer] = useState<string>(
    creditNoteDetails.customer || ""
  )
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(
    creditNoteDetails.customer_name || ""
  )
  const [selectedAddress, setSelectedAddress] = useState<string>(
    creditNoteDetails.customer_address || ""
  )
  const [selectedAddressDisplay, setSelectedAddressDisplay] = useState<string>(
    creditNoteDetails.customer_address_display || ""
  )

  // Return against input
  const [returnAgainstInput, setReturnAgainstInput] = useState(
    creditNoteDetails.return_against || ""
  )

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true)
      const response = await getCustomers()
      if (response.success) {
        setCustomers(response.data)
      } else {
        toast.error("Failed to load customers")
      }
      setLoadingCustomers(false)
    }
    fetchCustomers()
  }, [])

  // Fetch addresses when customer selected
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!selectedCustomer) {
        setAddresses([])
        return
      }
      setLoadingAddresses(true)
      const response = await getCustomerAddresses(selectedCustomer)
      if (response.success) {
        setAddresses(response.data)
      }
      setLoadingAddresses(false)
    }
    fetchAddresses()
  }, [selectedCustomer])

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
    setSelectedCustomer(customer.name)
    setSelectedCustomerName(customer.customer_name)
    setSelectedAddress("")
    setSelectedAddressDisplay("")
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
    setSelectedAddress(address.name)
    setSelectedAddressDisplay(displayAddress)
    setAddressOpen(false)
    setAddressSearch("")
  }

  const handleConfirm = useCallback(() => {
    if (!selectedCustomer) {
      toast.error("Please select a customer")
      return
    }
    if (!selectedAddress) {
      toast.error("Please select an address")
      return
    }

    // Update store
    setCustomer(selectedCustomer, selectedCustomerName)
    setCustomerAddress(selectedAddress, selectedAddressDisplay)

    if (returnAgainstInput) {
      setReturnAgainst(returnAgainstInput)
    }

    toast.success("Customer selected")
    router.push("/credit-note")
  }, [
    selectedCustomer,
    selectedCustomerName,
    selectedAddress,
    selectedAddressDisplay,
    returnAgainstInput,
    setCustomer,
    setCustomerAddress,
    setReturnAgainst,
    router,
  ])

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5 text-white" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
            <User className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Customer Details</h1>
            <p className="text-xs text-white/60">
              Select customer for credit note
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Customer Select */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <User className="size-3.5" />
            Customer
          </label>
          <div className="relative">
            <button
              onClick={() => setCustomerOpen(!customerOpen)}
              className="w-full rounded-xl bg-white/10 border border-white/15 p-3 transition-all hover:bg-white/15 flex items-center justify-between text-left"
            >
              <span
                className={cn(
                  "text-sm",
                  selectedCustomerName ? "text-white" : "text-white/40"
                )}
              >
                {selectedCustomerName || "Select customer..."}
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
                          selectedCustomer === customer.name && "bg-white/5"
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
          </label>
          <div className="relative">
            <button
              onClick={() => selectedCustomer && setAddressOpen(!addressOpen)}
              disabled={!selectedCustomer}
              className={cn(
                "w-full rounded-xl bg-white/10 border border-white/15 p-3 transition-all flex items-center justify-between text-left",
                selectedCustomer
                  ? "hover:bg-white/15"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "text-sm truncate pr-2",
                  selectedAddressDisplay ? "text-white" : "text-white/40"
                )}
              >
                {selectedAddressDisplay ||
                  (selectedCustomer
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
                          selectedAddress === address.name && "bg-white/5"
                        )}
                      >
                        <span className="text-sm text-white">
                          {address.address_title}
                        </span>
                        <span className="text-xs text-white/40 line-clamp-1">
                          {[address.address_line1, address.city, address.country]
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

        {/* Return Against */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <FileText className="size-3.5" />
            Return Against (Optional)
          </label>
          <input
            type="text"
            value={returnAgainstInput}
            onChange={(e) => setReturnAgainstInput(e.target.value)}
            placeholder="Enter original invoice number..."
            className="w-full rounded-xl bg-white/10 border border-white/15 p-3 text-sm text-white placeholder:text-white/40 transition-all hover:bg-white/15 focus:outline-none focus:border-white/30"
          />
          <p className="text-xs text-white/40 px-1">
            Reference to the original sales invoice being returned
          </p>
        </div>
      </div>

      {/* Floating Confirm Button */}
      <div className="bg-white/30 fixed bottom-0 left-0 right-0 w-full justify-center  z-50 flex gap-3 py-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          size="lg"
          onClick={handleConfirm}
          disabled={!selectedCustomer || !selectedAddress}
          className="shadow-lg shadow-emerald-500/20 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
        >
          Confirm Selection
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
