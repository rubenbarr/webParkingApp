/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createLocation,
  deleteLocationById,
  getLocationById,
  getkioscos,
  updateLocationById,
} from "@/api/locationApi";
import { getUsers, Response } from "@/api/usersApi";
import DetailCard from "@/components/DetailCard/Detailcard";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrashIcon } from "lucide-react";
import { getKioscos } from "@/api/kioscos";

interface ILabelItem {
  label: string;
  value: string;
  isChecked?: boolean;
}
interface item {
  id:string,
  name:string
}

interface IKiosco {
  title: string
  contact: string;
  kioscos: string;
  operators: string[] | [];
  serialNumber?: string;
  kioscoId:string
  locations:string
}

export default function Page() {
  const template = {
    title: {
      type: "input",
      label: "Titulo de kiosco",
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
    serialNumber: "",
    kioscos: [],
    operators: [],
  };

  const detailOptions = [
    {
      label: "Borrar",
      icon: TrashIcon,
      action: deleteLocationReq,
      requiresAuth: true,
      warningTitle: "¿Desea borrar Ubicación?",
    },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = "Nueva Ubicación";

  const { token, setLoadingGlobal, isLoadingGlobal, handleToast } = useAuth();

  const [DetailCardCardState, setDetailCardState] = useState(false);
  const [detailCardTitle, setDetailCardTitle] = useState(initialTitle);
  const [initTemplate, setInitTemplate] = useState(template);
  const [init, setInit] = useState<IKiosco>(initialData);
  const [edit, setEdit] = useState<IKiosco>(initialData);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [loading, SetLoading] = useState(false);
  const [canLoadMore, setCanLoadmore] = useState(true);
  const [kioscos, setKioscos] = useState<IKiosco[]>([]);
  const [filteredkioscos, setFilteredKioscos] = useState<IKiosco[]>([]);
  const [page, setPage] = useState(1);
  const [saveTitle, setSaveTitle] = useState<string>("Guardar");
  const [detailCardLoading, setDetailCardLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [kioscosPage, setKioscosPage] = useState(1);
  const [locationId, setLocationId] = useState<string | null>(null);

  const handleInputs = (key: string, value: string) => {
    return setEdit((prev) => ({ ...prev, [key]: value }));
  };
  async function getKioscosReq(page: number, isDeleted:boolean = false) {
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
          setFilteredKioscos(data)
          return setKioscos(data);
        }
        if (page === 1 && kioscos.length !== 0) {
          setFilteredKioscos(data)
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

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    return getKioscosReq(nextPage);
  };


  const getLocationData = async (locationId: string) => {
    setLoadingGlobal(true);
    const req = (await getLocationById(
      token as string,
      locationId
    )) as Response;
    if (req) {
      setLocationId(locationId);
      if (!req.state)
        return handleToast(
          "error",
          "Hubo un error obteniendo información de ubicación, intente más tarde"
        );
      setLoadingGlobal(false);
      if (req.data) {
        setIsNewLocation(false);
        const data = req.data as IKiosco;
        setDetailCardTitle(data.title);
        setOptionsMarked(data);
        setInit(data);
        setEdit(data);
        router.push(`/kioscos?locationId=${data.locationId}`, {
          scroll: false,
        });
        setDetailCardState(true);
      }
    }
  };

  const setOptionsMarked = (data: IKiosco) => {
    const kioscoData = data.kioscos.map((i: any) => ({
      label: i.name,
      value: i.id,
      isChecked: true,
    }));
    const InitoperatorsTemplate = data.operators.map((i: any) => ({
      label: i.name,
      value: i.id,
      isChecked: true,
    }));

    const kioscoIds = [] as string[];
    const operatorsIds = [] as string[];

    data.kioscos.map((i: any) => kioscoIds.push(i.id));
    data.operators.map((i: any) => operatorsIds.push(i.id));

    const InitTemplatekiosco = initTemplate.kioscos.values.map(
      (i: ILabelItem) => ({ ...i, isChecked: kioscoIds.includes(i.value) })
    );
    const InitTemplateOperators = initTemplate.operators.values.map(
      (i: ILabelItem) => ({ ...i, isChecked: operatorsIds.includes(i.value) })
    );

    const initMergeKioscos = [...kioscoData, ...InitTemplatekiosco];
    const initMergeOperators = [
      ...InitoperatorsTemplate,
      ...InitTemplateOperators,
    ];

    const uniqueKioscos = Array.from(
      new Map(initMergeKioscos.map((item) => [item.value, item])).values()
    );
    const uniqueOperators = Array.from(
      new Map(initMergeOperators.map((item) => [item.value, item])).values()
    );
    setInitTemplate((prev) => ({
      ...prev,
      kioscos: { ...prev.kioscos, values: uniqueKioscos },
    }));
    setInitTemplate((prev) => ({
      ...prev,
      operators: { ...prev.operators, values: uniqueOperators },
    }));
  };

  const hideDetailCard = () => {
    setDetailCardState(false);
    router.push("/kioscos", { scroll: false });
  };

  const handleNewLocation = async () => {
    router.push("/kioscos?isNew=true", { scroll: false });
    setDetailCardState(true);
    setIsNewLocation(true);
    setInit(initialData);
    setEdit(initialData);
    setDetailCardTitle(initialTitle);
    await getKioscosReq();
    await getOperatorsReq();
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

  const updateLocation = async() => {
    const modifiedValues: Partial<IKiosco> = {};
    Object.keys(edit).forEach((key) => {
      const k = key as keyof IKiosco;
      if(Array.isArray(edit[k])) {
        const initArrayValues =  init[k] as string[];
        const editArrayValues = edit[k] as string[];
        if (initArrayValues.length !== editArrayValues.length) {
          modifiedValues[k] = editArrayValues;
        }else {
          editArrayValues.forEach( i => {
            if (!initArrayValues.includes(i)) {
              
            }
          })
        }
      }
      if (init[k] !== edit[k]) {
        modifiedValues[k] = edit[k]
      }
    })
    setDetailCardLoading(true);
    const transformedData = transformDataToUpdate(modifiedValues) as Partial <IKiosco>;
    const req = await updateLocationById(token as string, locationId as string, transformedData)
    if (req) {
    setDetailCardLoading(false)
      if(req.state) {
        handleToast('success', 'Ubicación actualizada correctamente')
        setInit(edit);
        setIsEdit(false);
        getKioscosReq(page);
      } else handleToast('error', 'Hubo un error actualizando, intente nuevamente o más tarde')
    }   
  };

  const transformData = () => {
    const kioscos = [] as any;
    const operators = [] as any;
    if (edit.kioscos.length > 0)
      edit.kioscos.forEach((i: any) => kioscos.push(i?.id));
    if (edit.operators.length > 0)
      edit.operators.forEach((i: any) => operators.push(i?.id));

    const copy = {
      ...edit,
      kioscos,
      operators,
    };
    return copy;
  };
  const transformDataToUpdate = (data: IKiosco) => {
    const copy = {...data};

    if (data?.operators) {
      if (data.operators.length > 0 ) {
        const ids = []
        data.operators.forEach((i) => {ids.push(i.id) })
        copy.operators = ids;
      }
    }
    if (data?.kioscos) {
      if (data.kioscos.length > 0 ) {
        const ids = []
        data.kioscos.forEach((i) => {ids.push(i.id) })
        copy.kioscos = ids;
      }
    }
    console.log(copy);
    return copy
  }
  const handleSubmit = async () => {
    if (!isNewLocation) {
      return await updateLocation();
    }
    setDetailCardLoading(true);
    const transformedData = transformData();
    const req = (await createLocation(
      token as string,
      transformedData
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        router.replace(`/kioscos?locationId=${req.data}`, { scroll: false });
        handleToast("success", "Ubicaciónc creda correctamente");
        await getKioscosReq(page);
        setInit(edit);
        setIsNewLocation(false);
        setDetailCardTitle(edit.title);
        setIsEdit(false);
      } else {
        handleToast("error", req.message);
      }
    }
  };

  async function deleteLocationReq() {
    setDetailCardLoading(true);
    const req = (await deleteLocationById(
      token as string,
      locationId as string
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        setDetailCardState(false);
        router.push("/kioscos");
        handleToast("success", "Ubicación eliminada correctamente");
        getKioscosReq(page, true);
      } else {
        handleToast(
          "error",
          "No fue posible borrar ubicación, intente más tarde"
        );
      }
    }
  }

  const handleListValues = (
    key: string,
    value: string | number,
    wasChecked: boolean = false,
    label: string
  ) => {
    const currentValuesChecked: any = [];
    const editIds = edit[key as keyof IKiosco] as string[];

    if (Array.isArray(editIds))
      editIds.map((i: any) => currentValuesChecked.push(i.id));
    const currentTemplateValues = initTemplate[key].values.filter(
      (i) => i.value === value
    )[0] as ILabelItem;

    if (wasChecked) {
      if (!currentValuesChecked.includes(value)) {
        const newData = { id: value, name: label };
        setEdit((prev) => ({ ...prev, [key]: [...prev[key], newData] }));
        currentTemplateValues.isChecked = true;
        const currentValues = [...initTemplate[key].values].filter(
          (i) => i.value !== value
        );
        const merge = [...currentValues, currentTemplateValues];
        setInitTemplate((prev) => ({
          ...prev,
          [key]: { ...prev[key], values: merge },
        }));
      }
    } else {
      if (currentValuesChecked.includes(value)) {
        const unckechValue = [...initTemplate[key].values].filter(
          (i) => i.value === value
        )[0] as ILabelItem;
        const remainingValues = [...initTemplate[key].values].filter(
          (i) => i.value !== value
        ) as ILabelItem[];
        unckechValue.isChecked = false;
        const merge = [...remainingValues, unckechValue];
        const filterData = editIds.filter((i) => i.id !== value);
        setEdit((prev) => ({ ...prev, [key]: filterData }));

        setInitTemplate((prev) => ({
          ...prev,
          [key]: { ...prev[key], values: merge },
        }));
      }
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

  const handlefilter = (value:string) => {
    setFilterValue(value)
      const fileredkioscos = kioscos.filter(
    (l) =>
      l.title.toLocaleLowerCase().includes(value.toLocaleLowerCase()) ||
      l.contact.toLocaleLowerCase().includes(value.toLocaleLowerCase())
  );
  setFilteredKioscos(fileredkioscos)
  }

  useEffect(() => {
    getKioscosReq(page);
    const newUser = searchParams.get("isNew");
    const locationId = searchParams.get("locationId");
    if (newUser) {
      setDetailCardState(true);
      return setIsNewLocation(true);
    } 
      
    if (locationId) {
      setIsNewLocation(false);
      getLocationData(locationId);
    }
  }, []);

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
                <th className="">total de operadores</th>
              </tr>
            </thead>
            <tbody>
              {filteredkioscos.length > 0 ? (
                filteredkioscos.map((kiosco: IKiosco) => (
                  <tr
                    key={kiosco.kioscoId}
                    className=""
                    onClick={() =>
                      getLocationData(kiosco.kioscoId as string)
                    }
                  >
                    <td className="">{kiosco.title}</td>
                    <td className="">{kiosco.serialNumber} </td>
                    <td className="">{kiosco.contact}</td>
                    <td className="">{kiosco.locations}</td>
                    <td className="">{kiosco.operators}</td>
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
