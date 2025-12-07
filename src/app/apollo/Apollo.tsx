import React, { useEffect, useState } from 'react'
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/context/AuthContext';
import LoadingComponent from '@/components/Loading';


const GET_LAUNCHES  = gql`
    query GetLaunches($offset: Int, $limit: Int) {
        launchesPast(offset: $offset, limit: $limit) {
            mission_name
            launch_date_local
        }
    }
`

type Launches = {
    __typename: string;
    mission_name: string;
    launch_date_local: string;
}

type Query = {
    data: {
        launchesPast: Launches[]
    };
    loading: boolean;
    error: unknown;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchMore: any
}

export default function Apollo() {
    const LIMIT = 5;
    
    const { isLoadingGlobal, setLoadingGlobal } = useAuth()
    
    const [offset, setOffset] = useState(0);
    const [launches, setLaunches] = useState<Launches[] | []>([]);
    const [isLoadingMore, setIsloadingMore] = useState(false);
    
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, loading, error, fetchMore }: Partial<Query>  = useQuery(GET_LAUNCHES, {
        variables: { offset: offset, limit: LIMIT }
    });

    useEffect(() => {
        setLoadingGlobal(loading);
        if(!isLoadingMore) {
            if(data?.launchesPast){
                setLaunches(data?.launchesPast as Launches[])
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[data, loading])

    async function cargarMas() {
        setIsloadingMore(true)
        const cOffSet=  offset + 1;
        const result = await fetchMore({
            variables: { offset: cOffSet, limit: LIMIT }
        })
        setOffset(cOffSet);
        setLaunches(prev => [...prev, ...result.data.launchesPast])
    };
  return ( 
    <>
    {isLoadingGlobal && <LoadingComponent light={true} />}
    <div>
        <label>Datos</label>
        
        <table>
            <thead>
                <tr>
                    <th>Launch Name</th>
                    <th>Launch Date</th>
                </tr>
            </thead>
            <tbody>
                { launches.length === 0 ? (
                    <tr>
                        <td colSpan={2}>No Data</td>
                    </tr>
                    ) : 
                    launches.map((i, index) => (
                        <tr key={index}> 
                            <td>{i?.mission_name}</td>
                            <td>{i?.launch_date_local}</td>
                        </tr>
                    ))
                    
                }
            </tbody>
        </table>
        <div style={{display:'flex', justifyContent:'center', padding:"10px 10px"}}>
        <button className='primary-button' onClick={cargarMas}>
            Cargar Más
        </button>
        </div>
    </div>
    </>
  )
}
