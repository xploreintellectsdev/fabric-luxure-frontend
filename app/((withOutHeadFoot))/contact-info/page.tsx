import React from 'react'
import ContactInformation from '../../../pages/checkout/ContactInformation'
import OrderSummary from '../../../pages/checkout/OrderSummary'

function ContactInfo() {
  return (
    <div className='flex flex-col lg:flex-row '>
      <ContactInformation />
      <OrderSummary />
    </div>
  )
}

export default ContactInfo
