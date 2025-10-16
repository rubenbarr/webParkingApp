/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  getLocations,
} from "@/api/locationApi";
import { Response } from "@/api/usersApi";
import DetailCard from "@/components/DetailCard/Detailcard";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrashIcon } from "lucide-react";
import { createKiosco, deleteKioscoById, getKioscoById, getKioscos, updateKioscoById } from "@/api/kioscos";
import ManageIcon from "@/assets/icons/ManageIcon";

interface ILabelItem {
  label: string;
  value: string;
  isChecked?: boolean;
}
export interface item {
  id: string;
  name: string;
}

export interface IKiosco {
  title: string;
  contactName: string;
  contactPhone: string;
  location: item[];
  serialNumber?: string;
  kioscoId?: string;
  online?: string;
  active?: string;
}

interface ITemplateItem {
  type: string;
  label:string;
  values?: ILabelItem []
}

interface IinitTemplate  {
  title:  ITemplateItem
  serialNumber: ITemplateItem
  contactName: ITemplateItem
  contactPhone: ITemplateItem
  location: ITemplateItem | []
}


export default function Page() {
  const template = {
    title: {
      type: "input",
      label: "Titulo de kiosco",
    },
    serialNumber: {
      type: "input",
      label: "Número de serie",
    },
    contactName: {
      type: "input",
      label: "Nombre de contacto",
    },
    contactPhone: {
      type: "input",
      label: "Teléfono de contacto",
    },
    location: {
      type: "datalist",
      label: "Ubicación",
      values: [],
    },
  };
  const initialData = {
    title: "",
    serialNumber: "",
    contactName: "",
    contactPhone: "",
    location: [],
  };

  const detailOptions = [
    {
      label: "Borrar",
      icon: TrashIcon,
      action: deleteKioscoReq,
      requiresAuth: true,
      warningTitle: "¿Desea borrar Kiosco?",
    },
    {
      label: "Ver kiosco",
      icon: ManageIcon,
      action: goToViewKiosco,
      requiresAuth: false,
      warningTitle: "¿Desea ver Kiosco?",
    },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = "Nueva Ubicación";

  const { token, setLoadingGlobal, isLoadingGlobal, handleToast } = useAuth();

  const [DetailCardCardState, setDetailCardState] = useState(false);
  const [detailCardTitle, setDetailCardTitle] = useState(initialTitle);
  const [initTemplate, setInitTemplate] = useState<IinitTemplate>(template);
  const [init, setInit] = useState<IKiosco>(initialData);
  const [edit, setEdit] = useState<IKiosco>(initialData);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isNewKiosco, setIsNewKiosco] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [loading, SetLoading] = useState(false);
  const [canLoadMore, setCanLoadmore] = useState(true);
  const [kioscos, setKioscos] = useState<IKiosco[]>([]);
  const [filteredkioscos, setFilteredKioscos] = useState<IKiosco[]>([]);
  const [page, setPage] = useState(1);
  const [loctionsPage, setLoctionsPage] = useState(1);
  const [saveTitle, setSaveTitle] = useState<string>("Guardar");
  const [detailCardLoading, setDetailCardLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [kioscosPage, setKioscosPage] = useState(1);
  const [kioscoId, setKioscoId] = useState<string | null>(null);
  const [shouldReRenderOptions, SetShouldReRenderOptions] = useState(false);



  const handleInputs = (key: string, value: string) => {
    return setEdit((prev) => ({ ...prev, [key]: value }));
  };
  async function getKioscosReq(page: number, isDeleted: boolean = false) {
    setLoadingGlobal(true);
    const req = (await getKioscos(token as string, page, 5)) as Response;
    if (req) {
      setLoadingGlobal(false);
      if (req.state) {
        const data = req.data as IKiosco[];
        if (data.length === 0) {
          if (isDeleted) {
            setFilteredKioscos([]);
            setKioscos([]);
          }
          return setCanLoadmore(false);
        }
        if (kioscos.length === 0) {
          setFilteredKioscos(data);
          return setKioscos(data);
        }
        if (page === 1 && kioscos.length !== 0) {
          setFilteredKioscos(data);
          return setKioscos(data);
        } else {
          setFilteredKioscos((prev) => [...prev, ...data]);
          return setKioscos((prev) => [...prev, ...data]);
        }
      } else {
        handleToast(
          "error",
          `Hubo un error buscando Ubicacions, error ${req.message}`
        );
      }
    }
  }
  const getLocationsReq = async (locationPage = 1) => {
    const req = (await getLocations(
      token as string,
      locationPage,
      10
    )) as Response;
    if (req.state) {
      if (Array.isArray(req.data) && req.data.length > 0) {
        const locationsData = req.data.map((i: any) => ({
          label: i.title,
          value: i.locationId,
          isChecked:false
        }));
        setInitTemplate((prev: any) => ({
          ...prev,
          location: {
            ...prev.location,
            values: [...(locationsData as any)],
          },
        }));
      }
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    return getKioscosReq(nextPage);
  };

  const getKioscoData = async (kioscoId: string) => {
    setLoadingGlobal(true);
    const req = (await getKioscoById(
      token as string,
      kioscoId
    )) as Response;
    if (req) {
      setKioscoId(kioscoId);
      if (!req.state)
        return handleToast(
          "error",
          "Hubo un error obteniendo información de ubicación, intente más tarde"
        );
      setLoadingGlobal(false);
      if (req.data) {
        setIsNewKiosco(false);
        const data = req.data as IKiosco;
        setDetailCardTitle(data.title);
        setOptionsMarked(data);
        setInit(data);
        setEdit(data);
        router.push(`/kioscos?kioscoId=${data.kioscoId}`, {
          scroll: false,
        });
        setDetailCardState(true);
      }
    }
  };

  const setOptionsMarked = (data: IKiosco) => {
    const locationData = data.location.map((i: any) => ({
      label: i.name,
      value: i.id,
      isChecked: true,
    }));

    const locationsId = [] as string[];

    data.location.map((i: any) => locationsId.push(i.id));
    if (initTemplate?.location?.values && Array.isArray( initTemplate.location.values)) {

      const initLocationsFromTemplate = initTemplate.location.values.map(
        (i: ILabelItem) => ({ ...i, isChecked: locationsId.includes(i.value) })
      );
      const initMergeLocations = [...locationData, ...initLocationsFromTemplate] as ILabelItem[];
      
      const uniqueLocations = Array.from( new Map(initMergeLocations.map((item) => [item.value, item])).values()) as any;
     
      setInitTemplate((prev) => ({
      ...prev,
      location: { ...prev.location, values: uniqueLocations },
    }));
  }
  };

  const hideDetailCard = () => {
    setDetailCardState(false);
    router.push("/kioscos", { scroll: false });
  };

  const handleNewKiosco = async () => {
    await getLocationsReq();
    router.push("/kioscos?isNew=true", { scroll: false });
    setDetailCardState(true);
    setIsNewKiosco(true);
    setInit(initialData);
    setEdit(initialData);
    setDetailCardTitle(initialTitle);
  };
  const handlecanSubmit = () => {
    return Object.keys(edit).every((item) => {
      const val = edit[item as keyof IKiosco];
      if (Array.isArray(val)) {
        if (item === "kioscos") return true;
        return val.length > 0;
      }
      return val !== "";
    });
  };

  const updateLocation = async () => {
    const modifiedValues: Partial<IKiosco> = {};
    Object.keys(edit).forEach((key) => {
      const k = key as keyof IKiosco;
      if (Array.isArray(edit[k])) {
        const initArrayValues = init[k];
        const editArrayValues = edit[k];
        if (Array.isArray(initArrayValues) && initArrayValues.length !== editArrayValues.length) {
          modifiedValues[k] = edit as any;
        } else {
          editArrayValues.forEach((i) => {
            if (Array.isArray(initArrayValues) &&  !initArrayValues.includes(i)) {
              
            }
          });
        }
      }
      if (init[k] !== edit[k]) {
        modifiedValues[k] = edit[k] as any;
      }
    });
    setDetailCardLoading(true);
    const transformedData = transformDataToUpdate(
      modifiedValues as any
    ) as Partial<IKiosco>;
    const req = await updateKioscoById(
      token as string,
      transformedData,
      kioscoId as string,
    ) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        handleToast("success", "Kiosco actualizada correctamente");
        setInit(edit);
        setIsEdit(false);
        getKioscosReq(page);
      } else
        handleToast(
          "error",
          "Hubo un error actualizando, intente nuevamente o más tarde"
        );
    }
  };

  const transformData = () => {
    const location = [] as any;
    if (edit.location.length > 0) {
      edit.location.forEach((i: any) => location.push(i?.id));
    }
    const copy = {
      ...edit,
      location,
    };
    return copy;
  };

  const transformDataToUpdate = (data: IKiosco) => {
    const copy = { ...data } as Partial<IKiosco>
    if (data?.location && data.location.length > 0) {
        const ids = [] as string[];

        data.location.forEach((i) => {
          ids.push(i.id);
        });
        if(copy.location) { 
        //@ts-ignore
          copy.location = ids;
        }
    }
    return copy;
  };
  const handleSubmit = async () => {
    if (!isNewKiosco) {
      return await updateLocation();
    }
    setDetailCardLoading(true);
    const transformedData = transformData();
    const req = (await createKiosco(
      token as string,
      transformedData
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        router.replace(`/kioscos?kioscoId=${req.data}`, { scroll: false });
        handleToast("success", "Kiosco creado correctamente");
        await getKioscosReq(page);
        setInit(edit);
        setIsNewKiosco(false);
        setDetailCardTitle(edit.title);
        setIsEdit(false);
      } else {
        handleToast("error", req.message);
      }
    }
  };

  async function  deleteKioscoReq() {
    setDetailCardLoading(true);
    const req = (await deleteKioscoById(
      token as string,
      kioscoId as string
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        setDetailCardState(false);
        router.push("/kioscos");
        handleToast("success", "kiosco eliminado correctamente");
        getKioscosReq(page, true);
      } else {
        handleToast(
          "error",
          "No fue posible borrar ubicación, intente más tarde"
        );
      }
    }
  }
  function goToViewKiosco(){
    return router.replace(`/kioscos/kioscoInfo?kioscoId=${kioscoId}`); 
  }


  const handleListValues = (
    key: string,
    value: string | number,
    wasChecked: boolean = false,
    label: string
  ) => {
    const k = key as keyof IinitTemplate
    const currentInitTemplate = initTemplate[k].values as ILabelItem[];
    if(wasChecked) {

      const newItem = {id: value, name: label}
      setEdit(prev => ({...prev, [key]: [{...newItem}]}))
      const updatedValues  = currentInitTemplate.map(item => ({ ...item, isChecked: item.value === value}));
      setInitTemplate(prev => ({...prev, [key]: {...prev[k], values: [...updatedValues]} }));
      SetShouldReRenderOptions(true);
    } else {
      setEdit(prev => ({...prev, [key]: []}))
      const updatedValues  = currentInitTemplate.map(item => ({ ...item, isChecked:false}));
      setInitTemplate(prev => ({...prev, [key]: {...prev[k], values: [...updatedValues]} }));
    }

  };
  const wasEdited = () => {
    const initKeys = Object.keys(init);
    return initKeys.some((key) => {
      const val1 = init[key as keyof IKiosco];
      const val2 = edit[key as keyof IKiosco];
      if (Array.isArray(val2) && Array.isArray(val1)) {
        if (val2.length === 0 && val1.length == 0) return false;
        if (val2.length > 0 && val1?.length == 0) {
          return true;
        }
        if (val2.length > 0 && val1.length > 0) {
          const val1Ids = Array.from(val1.map((i) => i.id));
          const val2Ids = Array.from(val2.map((i) => i.id));
          const different =
            val1Ids.some((id) => !val2Ids.includes(id)) ||
            val2Ids.some((id) => !val1Ids.includes(id));
          return different;
        }
      }
      return val1 !== val2;
    });
  };

  const handlefilter = (value: string) => {
    setFilterValue(value);
    const fileredkioscos = kioscos.filter(
      (l) =>
        l.title.toLocaleLowerCase().includes(value.toLocaleLowerCase()) ||
        l.contactName.toLocaleLowerCase().includes(value.toLocaleLowerCase())
    );
    setFilteredKioscos(fileredkioscos);
  };

  useEffect(() => {
    getKioscosReq(page);
    getLocationsReq();
    const newUser = searchParams.get("isNew");
    const kioscoId = searchParams.get("kioscoId");
    if (newUser) {
      setDetailCardState(true);
      return setIsNewKiosco(true);
    }
    if (kioscoId) {
      setIsNewKiosco(false);
      setKioscoId(kioscoId);
    }
  }, []);
  
useEffect(() => {

  if (kioscoId && Array.isArray(initTemplate.location.values) && initTemplate?.location?.values.length > 0) {
    getKioscoData(kioscoId);
  }
  //@ts-ignore
}, [kioscoId, initTemplate?.location?.values.length]);

  useEffect(() => {
    setCanSubmit(handlecanSubmit());
    setIsEdit(wasEdited());
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
        isNewItem={isNewKiosco}
        detailCardOptions={detailOptions} 
        shouldReRenderOptions={shouldReRenderOptions}
      />
      <div className="main-content">
        <h1 className="main-header">Kioscos</h1>
        <div className="primary-column">
          <button className="primary-button" onClick={handleNewKiosco}>
            Agregar Nuevo
          </button>

          <input
            type="text"
            placeholder="Buscar Ubicacion..."
            className="filter-input"
            value={filterValue}
            onChange={(e) => handlefilter(e.target.value)}
          />
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">Kiosco</th>
                <th className="">Numero de serie</th>
                <th className="">Contacto</th>
                <th className="">Ubicaión</th>
                <th className="">Activo</th>
                <th className="">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {filteredkioscos.length > 0 ? (
                filteredkioscos.map((kiosco: IKiosco) => (
                  <tr
                    key={kiosco.kioscoId}
                    className=""
                    onClick={() => getKioscoData(kiosco.kioscoId as string)}
                  >
                    <td className="">{kiosco.title}</td>
                    <td className="">{kiosco.serialNumber} </td>
                    <td className="">{kiosco.contactName}</td>
                    <td className="">{kiosco.location as any}</td>
                    <td className="">{kiosco.active}</td>
                    <td className="">{kiosco.online}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="">
                    No se encontraron ubicaciones
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
