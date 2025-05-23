'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { Crown } from 'lucide-react'
import { BillingToggle } from "./BillingToggle"
import { PricingContent } from "./PricingContent"
import { getAvailablePlans, requestPayment } from "@/actions/payment-actions"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

export default function PricingModal() {
  const [isOuterExpanded, setIsOuterExpanded] = useState(false)
  const [isInnerVisible, setIsInnerVisible] = useState(false)
  const [areCardsVisible, setAreCardsVisible] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [timeoutIds, setTimeoutIds] = useState<number[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [planName, setPlanName] = useState<string>('')
  const pathname = usePathname().slice(1)
  const router = useRouter()
  const toggleExpand = () => {
    if (isOuterExpanded) {
      setAreCardsVisible(false)
      createTrackedTimeout(() => setIsInnerVisible(false), 300)
      createTrackedTimeout(() => setIsOuterExpanded(false), 500)
    } else {
      setIsOuterExpanded(true)
      createTrackedTimeout(() => setIsInnerVisible(true), 300)
      createTrackedTimeout(() => setAreCardsVisible(true), 800)
    }
  }

  const createTrackedTimeout = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay)
    setTimeoutIds(prev => [...prev, id])
    return id
  }

  useEffect(() => {
    return () => timeoutIds.forEach(id => clearTimeout(id))
  }, [timeoutIds])


    const [plansList, setPlansList] = useState<any>()
    console.log('Available Plans', plansList)

    const setAvailablePlans = async () => {
      const plans = await getAvailablePlans();
      console.log("PlansFetch", plans)
       setPlansList(plans?.data)
    }
  
    useEffect(() => {
       setAvailablePlans()
    }, [])
  
  
    const makePayment = async (plan: string) => {
      try {
        setLoading(true)
        const pickedPlan = plansList.filter((x: any) => x.name === plan)
        const paymentPlanId = pickedPlan[0].id
        const amount = pickedPlan[0].amount
        setPlanName(pickedPlan[0].name)
        if(paymentPlanId && amount) {
              const result = await requestPayment (pathname, amount, paymentPlanId)
              console.log('Payment', result)
              if(result?.data) {
              setPlanName('')
              setLoading(false)
              router.push(result?.data?.link)
              }
        }
      } catch (error) {
        setPlanName('')
        setLoading(false)
        console.log('Error', error)
        alert('Error requesting to pay')
      }
    }

  return (
    <div>
      <div 
        onClick={toggleExpand}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <Crown className="w-4 h-4" />
        <span>Upgrade</span>
      </div>

      <div
        className={`fixed inset-0 bg-white z-50 transition-opacity duration-500 ${
          isOuterExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-start pt-16">
          <button
            onClick={toggleExpand}
            className="absolute top-4 right-4 p-2"
          >
            <Image src="/close.svg" alt="Close" width={30} height={30} />
          </button>

          <div className="text-center px-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Simple, Transparent Pricing
            </h2>
            <p>{pathname}</p>
            <p className="text-gray-600 max-w-xl mx-auto">
              Start free then upgrade as you grow. No hidden fees, cancel anytime.
            </p>
            
            <BillingToggle
              billingInterval={billingInterval}
              setBillingInterval={setBillingInterval}
            />
          </div>

          <div
            className={`mt-3 bg-white w-11/12 transform origin-top transition-transform duration-500 overflow-y-auto ${
              isInnerVisible ? 'scale-y-100 max-h-[80vh]' : 'scale-y-0 max-h-0'
            }`}
          >
            <div className="py-8 bg-gray-100">
              <div className="mx-auto px-4">
                <div className={`transition-opacity duration-300 ${
                  areCardsVisible ? 'opacity-100' : 'opacity-0'
                }`}>
                  <PricingContent billingInterval={billingInterval} makePayment={makePayment} loading={loading} planName={planName} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}