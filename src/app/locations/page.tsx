/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createLocation, deleteLocationById, getLocationById, getLocations } from "@/api/locationApi";
import { getUsers, Response } from "@/api/usersApi";
import DetailCard from "@/components/DetailCard/Detailcard";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrashIcon } from "lucide-react";
import { getKioscos } from "@/api/kioscos";

interface ILabelItem {
  label: string
  value:string,
  isChecked?:boolean
}

interface ILocation {
  title: string;
  address: string;
  contact: string;
  kioscos: string[] | [];
  operators: string[] | [];
  createdAt?: string;
  createdBy?: string;
  locationId?: string;
  totalKioscos?: number;
  serialNumber?:string
}

export default function Page() {
  const template = {
    title: {
      type: "input",
      label: "Nombre de ubicación",
    },
    address: {
      type: "input",
      label: "Dirección",
    },
    contact: {
      type: "input",
      label: "Contacto",
    },
    kioscos: {
      type: "datalist",
      label: "Kioscos",
      values: [],
    },
    operators: {
      type: "datalist",
      label: "Operadores",
      values: [],
    },
  };
  const initialData = {
    title: "",
    address: "",
    contact: "",
    kioscos: [],
    operators: [],
  };
    
  const detailOptions = [
    {
      label: "Borrar",
      icon: TrashIcon,
      action: deleteLocationReq,
      requiresAuth: true,
      warningTitle: "¿Desea borrar Usuario?",
    },
  ];
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = 'Nueva Ubicación'
  
  const { token, setLoadingGlobal, isLoadingGlobal, handleToast } = useAuth();


  const [DetailCardCardState, setDetailCardState] = useState(false);
  const [detailCardTitle, setDetailCardTitle] = useState(initialTitle);
  const [initTemplate, setInitTemplate] = useState(template);
  const [init, setInit] = useState<ILocation>(initialData);
  const [edit, setEdit] = useState<ILocation>(initialData);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isNewLocation, setIsNewLocation]= useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [loading, SetLoading] = useState(false);
  const [canLoadMore, setCanLoadmore] = useState(true);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [page, setPage] = useState(1);
  const [saveTitle, setSaveTitle] = useState<string>("Guardar");
  const [detailCardLoading, setDetailCardLoading] = useState(false);
  const [usersPage, setUsersPage]= useState(1);
  const [kioscosPage, setKioscosPage]= useState(1);
  const [locationId, setLocationId] = useState<string | null>(null)




  const handleInputs = (key: string, value: string) => {
    return setEdit((prev) => ({ ...prev, [key]: value }));
  };
  async function getLocationsReq(page:number) {
    setLoadingGlobal(true);
    const req = (await getLocations(token as string, page, 5)) as Response;
    if (req) {
      setLoadingGlobal(false);
      if (req.state) {
        if(req?.data?.length === 0) {
         return setCanLoadmore(false)
        }
        if(locations.length === 0 ){
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return setLocations(req.data as any);
        } if(page === 1 && locations.length!== 0){
          return setLocations(req.data as any);
        }
        else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setLocations(prev => [...prev, ...req.data as any])
        }
      } else {
        handleToast(
          "error",
          `Hubo un error buscando Ubicacions, error ${req.message}`
        );
      }
    }
  }
  
    const getOperatorsReq = async() => {
    const req = await getUsers(token as string, usersPage) as Response

    if(req?.state) {
      if (req.data.length > 0 ) {
        const options = req.data.map((i:any) => (
          {
            label: i?.fullname,
            value: i?.userId,
          }
        ));
        setInitTemplate((prev:any )=> ({
          ...prev,
          operators: {
            ...prev.operators,
            values: [...options]
          }
        }))
      }
    }
  }

  const getKioscosReq = async() => {
    const req = await getKioscos(token as string, kioscosPage, 5, true ) as Response;
    if(req.state){
      if(req.data.length > 0) {
        const kioscosData = req.data.map((i:any) => ({label: i.title, value: i.kioscoId}))
        setInitTemplate((prev:any) => ({
          ...prev,
          kioscos: {
            ...prev.kioscos,
            values: [...kioscosData as any]

          }
        }))

      }
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage);
    return getLocationsReq(nextPage);
  };

  const fileredLocations = locations.filter(
    (l) =>
      l.title.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()) ||
      l.contact.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())
  );

  const getLocationData = async (locationId: string) => {
    setLoadingGlobal(true);
    const req = await getLocationById(token as string, locationId) as Response
    if(req){
      setLocationId(locationId);
      if (!req.state) return handleToast('error', 'Hubo un error obteniendo información de ubicación, intente más tarde')
        setLoadingGlobal(false)
      if(req.data){ 
        setIsNewLocation(false);
        const data = req.data as ILocation;
        setDetailCardTitle(data.title);
          setOptionsMarked(data);
          setInit(data)
          setEdit(data)
          router.push(`/locations?locationId=${data.locationId}`, {scroll:false});
          setDetailCardState(true);
        }
    }
  };

  const setOptionsMarked = (data: ILocation | string[]) => {
    const kioscoData = data.kioscos.map((i:any) => ({  label: i.name,  value: i.id, isChecked: true }))
    const InitoperatorsTemplate = data.operators.map((i:any) => ({label: i.name, value: i.id, isChecked: true }));

    const kioscoIds = [] as string[];
    const operatorsIds = [] as string[];

    data.kioscos.map((i:any) => kioscoIds.push(i.id));
    data.operators.map((i:any) => operatorsIds.push(i.id));
    
    const InitTemplatekiosco = initTemplate.kioscos.values.map((i:ILabelItem) => ({...i, isChecked: kioscoIds.includes(i.value) }));
    const InitTemplateOperators = initTemplate.operators.values.map((i:ILabelItem) => ({...i,isChecked: operatorsIds.includes(i.value) }));

    const initMergeKioscos = [...kioscoData, ...InitTemplatekiosco]
    const initMergeOperators = [...InitoperatorsTemplate, ...InitTemplateOperators]

    const uniqueKioscos = Array.from(new Map(initMergeKioscos.map((item) => [item.value, item] )).values() );
    const uniqueOperators = Array.from(new Map(initMergeOperators.map((item) => [item.value, item] )).values() );
    setInitTemplate(prev => ({...prev, kioscos: {...prev.kioscos, values: uniqueKioscos }}));
    setInitTemplate(prev => ({...prev, operators: {...prev.operators, values: uniqueOperators }}));
  
  }



  const hideDetailCard = () => {
    setDetailCardState(!DetailCardCardState);
    router.push("/locations", { scroll: false });
  };


  const handleNewLocation = async() => {
    router.push('/locations?isNew=true', {scroll:false})
    setDetailCardState(true);
    setIsNewLocation(true);
    setInit(initialData);
    setEdit(initialData);
    setDetailCardTitle(initialTitle)
    await getKioscosReq();
    await getOperatorsReq();

    
  };
  const handlecanSubmit = () => {
    return Object.keys(edit).every((item) => {
      const val = edit[item as keyof ILocation];
      if (Array.isArray(val)) {
        if(item === 'kioscos') return true
        return val.length > 0;
      }
      return val !== "";
    });
  };

  const updateLocation = () => {
    // setLoadingGlobal(true);
    const dataTransformed = Object.keys(edit).forEach(i => {
      const val1 = edit[i as keyof ILocation]
      const val2 = init[i as keyof ILocation]
      if(Array.isArray(val1)){
        if (true) return
      }
    })
  }

  const handleSubmit = async() => {
    if(!isNewLocation) {
      return updateLocation();
    }
    setDetailCardLoading(true);
    const req = await createLocation(token as string, edit) as Response;
    if(req){
      setDetailCardLoading(false);
      if (req.state) {
        router.replace(`/locations?locationId=${req.data}`, {scroll:false})
        handleToast('success', 'Ubicaciónc creda correctamente');
        await getLocationsReq(page)
        setInit(edit);
      } else {
        handleToast('error', req.message);
      }
    }
  }



  async function deleteLocationReq(){
    setDetailCardLoading(true);
    const req = await deleteLocationById(token as string, locationId as string) as Response;
    if(req) {
      setDetailCardLoading(false);
      if(req.state) {
        setDetailCardState(false);
        router.push('/locations')
        handleToast('success', 'Ubicación eliminada correctamente')
        getLocationsReq(page);
      } else {
        handleToast('error', 'No fue posible borrar ubicación, intente más tarde')
      }
    }
  }

  const handleListValues = (
    key: string,
    value: string | number,
    wasChecked: boolean = false,
    label:string
  ) => {
    const currentValuesChecked:any = [];
    const editIds = edit[key as keyof ILocation] as string[];

    if(Array.isArray(editIds)) editIds.map((i:any) => currentValuesChecked.push(i.id));
    const currentTemplateValues = initTemplate[key].values.filter(i => i.value === value)[0] as ILabelItem;

    if(wasChecked){
      if(!currentValuesChecked.includes(value)){
        const newData = { id: value, name: label } 
        setEdit(prev => ({...prev, [key]: [...prev[key], newData ]  }))
        currentTemplateValues.isChecked = true;
        const currentValues = [...initTemplate[key].values ].filter(i => i.value !== value);
        const merge = [...currentValues, currentTemplateValues]
        setInitTemplate(prev =>  ({...prev, [key]: {...prev[key], values: merge}}));
      }
    } else {
      if(currentValuesChecked.includes(value)){
        const unckechValue = [...initTemplate[key].values ].filter(i => i.value === value)[0] as ILabelItem;
        const remainingValues = [...initTemplate[key].values ].filter(i => i.value !== value) as ILabelItem[];
        unckechValue.isChecked = false;
        const merge = [...remainingValues, unckechValue]
        const filterData = editIds.filter(i => i.id !== value);
        setEdit(prev => ({...prev, [key]: filterData }))

        setInitTemplate(prev =>  ({...prev, [key]: {...prev[key], values: merge}}));

      }
    }
  };
  const wasEdited = () => {
    const initKeys = Object.keys(init);
    return initKeys.some((key) => {
      const val1 = init[key as keyof ILocation];
      const val2 = edit[key as keyof ILocation];
      if (Array.isArray(val2) && Array.isArray(val1)) {
        if (val2.length === 0 && val1.length == 0) return false;
        if (val2.length > 0 && val1?.length == 0) {
          return true;
        }
        if (val2.length > 0 && val1.length > 0) {
          const val1Ids = Array.from(val1.map(i => i.id));
          const val2Ids = Array.from(val2.map(i => i.id));
        const different = val1Ids.some(id => !val2Ids.includes(id)) || 
                          val2Ids.some(id => !val1Ids.includes(id));
        return different;

        }
      }
      return val1 !== val2;
    });
  };

  useEffect(() => {
    getLocationsReq(page);
    getOperatorsReq();
    getKioscosReq();
    const newUser = searchParams.get('newUser')
    const locationId = searchParams.get('locationId')
    if(newUser) return setIsNewLocation(true);
    if(locationId){
      setIsNewLocation(false);
      getLocationData(locationId);
    }
  }, []);

  useEffect(() => {
    setCanSubmit(handlecanSubmit());
    setIsEdit(wasEdited())
  }, [edit]);

  return (
    <>
      <DetailCard
        detailCardState={DetailCardCardState}
        handleDetailState={hideDetailCard}
        headerTitle={detailCardTitle}
        buttonSaveTitle={saveTitle}
        template={initTemplate}
        values={edit}
        handleValues={handleInputs}
        canSubmit={canSubmit}
        isEdit={isEdit}
        handleSubmit={handleSubmit}
        handleListValues={handleListValues}
        isLoading={detailCardLoading}
        isNewItem={isNewLocation}
        detailCardOptions={detailOptions}
      />
      <div className="main-content">
        <h1 className="main-header">Ubicaciones</h1>
        <div className="primary-column">
          <button className="primary-button" onClick={handleNewLocation}>
            Agregar Nuevo
          </button>

          <input
            type="text"
            placeholder="Buscar Ubicacion..."
            className="filter-input"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">Ubicación</th>
                <th className="">Dirección</th>
                <th className="">contacto</th>
                <th className="">Creado el</th>
                <th className="">Creado Por</th>
                <th className="">Kioscos</th>
                <th className="">Operadores</th>
              </tr>
            </thead>
            <tbody>
              {fileredLocations.length > 0 ? (
                fileredLocations.map((location: ILocation) => (
                  <tr
                    key={location.locationId}
                    className=""
                    onClick={() =>
                      getLocationData(location.locationId as string)
                    }
                  >
                    <td className="">{location.title}</td>
                    <td className="">{location.address} </td>
                    <td className="">{location.contact}</td>
                    <td className="">{location.createdAt}</td>
                    <td className="">{location.createdBy}</td>
                    <td className="">{location.kioscos}</td>
                    <td className="">{location.operators}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className={"load-more-container"}>
            {canLoadMore ? (
              <button className={"load-more-button"} onClick={loadMore}>
                Cargar mas
              </button>
            ) : (
              <label>No hay más datos</label>
            )}
          </div>
        )}
      </div>
    </>
  );
}
