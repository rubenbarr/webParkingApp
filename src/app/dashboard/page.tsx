'use client'
import { useRouter } from 'next/navigation';
import style from './dashboardStyle.module.scss'

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className={style["main-content"]}>
      {/* Header */}
      <h1 className="main-header">Dashboard</h1>

      {/* Stats Grid */}
      <div className={style["content-grid"]}>
        
        {/* Card */}
        <div className="" onClick={() => router.push('/locations')}>
          <h2 className="">Total de estacionamientos</h2>
          <p className="">10</p>
        </div>

        <div className="" onClick={() => router.push('/kioscos')}>
          <h2 className="">Total de kioscos</h2>
          <p className="">9</p>
        </div>        
      </div>
      <div className={style["content-grid"]}>
        
        {/* Card */}
        <div className="" onClick={() => router.push('/users')}>
          <h2 className="">Total de Usuarios</h2>
          <p className="">10</p>
        </div>

        <div className="" onClick={() => router.push('/users')}>
          <h2 className="">Total de operadores</h2>
          <p className="">9</p>
        </div>        
      </div>
    </div>
  );
}
