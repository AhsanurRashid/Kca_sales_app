import CartItemsSummery from "@/components/dashboard/CartItemsSummery"
import CustomerSummery from "@/components/dashboard/CustomerSummery"
import SubmitOrderButton from "@/components/dashboard/SubmitOrderButton"

const OrderPage = () => {
  return (
    <div className="flex items-start lg:flex-row flex-col-reverse lg:divide-x h-full lg:gap-0 gap-6 divide-white/20">
      <div className="lg:w-1/2 w-full">
        <CustomerSummery />
      </div>
      <div className="lg:w-1/2 w-full lg:pl-4 pl-0">
        <CartItemsSummery />
        <SubmitOrderButton />
      </div>
    </div>
  )
}

export default OrderPage
