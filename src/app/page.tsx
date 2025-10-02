'use client'
import React, { useEffect, useState } from 'react'
import LoginPage from './login/page'
import { useAuth } from '@/context/AuthContext'
import LoadingIcon from '@/assets/icons/LoadingIcon';
import { validateToken } from '@/api/authApi';
import { useRouter } from 'next/navigation';
import LoadingComponent from '@/components/Loading';


interface RequestType {
  data: string[];
  message: string;
  state: boolean
}


export default function Page() {
  const { token, handleToast } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean | null>(false);
  const [validToken, setValidToken] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const validateTokenRe = async() => {
      try {
        if (!token){
          router.replace('/login')
        }
        setIsLoading(true);
        const req = await validateToken(token as string) as RequestType;
        if (req) setIsLoading(false);
        if (req.state){
          router.replace("/dashboard")
        } else 
        {
          router.replace("/login")
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.message  === 'Failed to fetch'){
          handleToast('error', 'Error en servidor, intente más tarde')
        }
        router.replace("/login")
      } finally{
        setIsLoading(false);
        router.replace("/login")
      }
    }
    if(token){
      validateTokenRe()
    } else {
      setIsLoading(false);
      router.replace("/login")
    }
  },[token])


  if (isLoading || isLoading === null) {
    return <LoadingComponent/>;
  } else {
    <LoginPage/>
  }
}
