import React from 'react'
import './ReportCard.css'
import userLogo from '../recursos/image/Image.svg'

const ReportCard = () => {
  return (
   <>
   <section className="report-card-container">
    <div className='report-card-container-content'>
    <img src={userLogo} alt="img logo" />
        <p>Informe de Usuarios registrados</p>
        
        <button>Ver</button>
    </div>
   </section>
   </>
  )
}

export default ReportCard
