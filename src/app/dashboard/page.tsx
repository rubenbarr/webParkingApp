'use client'
import style from './dashboardStyle.module.scss'

export default function DashboardPage() {
  return (
    <div className={style["main-content"]}>
      {/* Header */}
      <h1 className="main-header">Dashboard</h1>

      {/* Stats Grid */}
      <div className={style["content-grid"]}>
        
        {/* Card */}
        <div className="">
          <h2 className="">Total de estacionamientos</h2>
          <p className="">10</p>
        </div>

        <div className="">
          <h2 className="">Estacionamientos Activos</h2>
          <p className="">9</p>
        </div>

        <div className="">
          <h2 className="">Estacionamientos Inactivos</h2>
          <p className="">1</p>
        </div>
        
      </div>
    </div>
  );
}
