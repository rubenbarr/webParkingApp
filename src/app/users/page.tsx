/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import DetailCard from "@/components/DetailCard/Detailcard";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TrashIcon } from "lucide-react";
import cn from "classnames";

import { getLocations } from "@/api/locationApi";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  Response,
  updateUser,
} from "@/api/usersApi";
import { useAuth } from "@/context/AuthContext";

import styles from "./styles/usersStyles.module.scss";

interface Location {
  id: string;
  name: string;
  isChecked?: boolean;
}
interface Location2 {
  label: string;
  value: string;
  isChecked?: boolean;
}

export interface UserTemplate {
  fullname: string;
  phone: string;
  direction: string;
  email: string;
  location?: Location[] | [];
  userId?: string;
  status?: string;
  type?: string;
  createdAt?: string;
}
interface Ivalues {
  value: string;
  label: string;
  isChecked?: boolean;
}
interface ITemplate {
  fullname: {
    type: string;
    label: string;
  };
  type: {
    type: string;
    label: string;
    values: Ivalues[];
  };
  phone: {
    type: string;
    label: string;
  };
  direction: {
    type: string;
    label: string;
  };
  email: {
    type: string;
    label: string;
    canBeModified: boolean;
  };
  location: {
    type: string;
    label: string;
    values: Ivalues[];
  };
}

export default function Users() {
  const template = {
    fullname: {
      type: "input",
      label: "Nombre Completo",
    },
    type: {
      type: "list",
      label: "Tipo de usuario",
      values: [
        { value: "", label: "Seleccione un Rol" },
        { value: "global-admin", label: "Administrador" },
        { value: "operador", label: "Operador" },
      ],
    },
    phone: {
      type: "input",
      label: "Teléfono",
    },
    direction: {
      type: "input",
      label: "Dirección",
    },
    email: {
      type: "input",
      label: "Correo",
      canBeModified: false,
    },
    location: {
      type: "datalist",
      label: "Ubicaciones",
      values: [],
      disable:false
    },
  };

  const initialDataState = {
    fullname: "",
    type: "",
    phone: "",
    direction: "",
    email: "",
    location: [],
  };

  const detailOptions = [
    {
      label: "Borrar",
      icon: TrashIcon,
      action: deleteUserReq,
      requiresAuth: true,
      warningTitle: "¿Desea borrar Usuario?",
    },
  ];

  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, handleToast, isLoadingGlobal, setLoadingGlobal } = useAuth();

  const [filterValue, setFilterValue] = useState("");
  const [users, setUsers] = useState<UserTemplate[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [DetailCardCardState, setDetailCardState] = useState(false);
  const [saveTitle, setSaveTitle] = useState<string>("Guardar");
  const [detailCardTitle, setDetailCardTitle] = useState("Nuevo Usuario");
  const [canSubmit, setCanSubmit] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [initTemplate, setInitTemplate] = useState<ITemplate>(template);
  const [init, setInit] = useState<UserTemplate>(initialDataState);
  const [edit, setEdit] = useState<UserTemplate>(initialDataState);
  const [temporalEdit, setTemporalEdit] =
    useState<UserTemplate>(initialDataState);
  const [detailCardLoading, setDetailCardLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [canLoadMore, setCanLoadmore] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsEdit(wasEdited());
    setCanSubmit(handleCanSubmit());
  }, [edit]);

  useEffect(() => {
    fetchData();
    const newUser = searchParams.get("newUser");
    const user = searchParams.get("userId");
    fetchLocations();
    if (user) {
      getUserFromList(user);
    }
    if (newUser) {
      setDetailCardState(true);
    }
  }, []);

  const filterUsersByvalue = (value: string) => {
    setFilterValue(value);
    const filterUsers = users.filter(
      (u) =>
        u.fullname.toLowerCase().includes(value.toLowerCase()) ||
        u.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filterUsers);
  };

  const setOptionsifChecked = async (data: UserTemplate) => {
    if (data.location && data.location.length > 0) {
      const locations = data.location.map((i) => ({
        label: i.name,
        value: i.id,
        isChecked: true,
      }));
      const currentLocationsInTemplate = initTemplate.location.values.map(
        (i: any) => ({ ...i, isChecked: false })
      );
      const mergeLocations = [...currentLocationsInTemplate, ...locations];
      const uniqueKiocos = Array.from(
        new Map(mergeLocations.map((i: any) => [i?.value, i])).values()
      );
      setInitTemplate((prev) => ({
        ...prev,
        location: { ...prev.location, values: uniqueKiocos },
      }));
    } else {
      await fetchLocations(data.location);
    }
  };

  const handleInputs = (key: string, value: string | number) => {
    if (key === "phone") {
      if (!isNaN(value as number)) {
        return setEdit((prev) => ({
          ...prev,
          [key as keyof UserTemplate]: value,
        }));
      }
    } else {
      setTemporalEdit((prev) => ({ ...prev, [key]: value }));
      return setEdit((prev) => ({ ...prev, [key]: value }));
    }
  };

  function transformUser(data: UserTemplate) {
    const locations: string[] = [];
    data.location?.forEach((i) => {
      locations.push(i.id);
    });
    const newData = {
      ...data,
    };
    setInit(newData as UserTemplate);
    setEdit(newData as UserTemplate);
  }
  function transformUserToHandle(data: UserTemplate) {
    const locations: string[] = [];
    data.location?.forEach((i) => {
      locations.push(i.id);
    });
    const newData = {
      ...data,
      location: locations
    };
    return newData;
  }
  const getUserFromList = async (userId: string) => {
    setUserId(userId);
    setLoadingGlobal(true);
    const request = (await getUserById(userId, token as string)) as Response;
    setLoadingGlobal(false);
    if (request.state) {
      setIsNewUser(false);
      if (request.data && Array.isArray(request.data)) {
        const data = request.data[0] as UserTemplate;
        const user = data;
        router.push(`/users/?userId=${user?.userId}`, { scroll: false });
        transformUser(user);
        setDetailCardState(!DetailCardCardState);
        setOptionsifChecked(user);
        setDetailCardTitle(user?.fullname as string);
      }
    }
  };

  async function deleteUserReq() {
    setDetailCardLoading(true);
    const req = (await deleteUser(
      userId as string,
      token as string
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      setDetailCardState(false);
      if (req.state) {
        handleToast("success", "Usuario Eliminado Correctamente");
        router.replace("/users");
        await fetchData();
      } else {
        handleToast("error", `Error eliminando usuario, ${req.message}`);
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
    const editIds = edit[key as keyof ILocation] as string[];

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
      const val1 = init[key as keyof UserTemplate];
      const val2 = edit[key as keyof UserTemplate];
      if (Array.isArray(val2) && Array.isArray(val1)) {
        if (val2.length === 0 && val1.length == 0) return false;
        if (val2.length > 0 && val1?.length == 0) {
          return true;
        }
        if (val2.length > 0 && val1?.length > 0) {
          val2.forEach((i) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return !val1?.includes[i];
          });
        }
      }
      return val1 !== val2;
    });
  };

  const handleCanSubmit = () => {
    const values = Object.keys(edit);
    if (edit.type === 'global-admin'){
      setInitTemplate(prev => ({...prev, location: {...prev.location, disable: true} }))
    } else setInitTemplate(prev => ({...prev, location: {...prev.location, disable: false} }))
    return values.every((v) => {
      // if (edit.type !== 'global-admin' && Array.isArray(edit[v as keyof UserTemplate])) {
      //   return edit[v as keyof UserTemplate]?.length !== 0;
      // }
      return edit[v as keyof UserTemplate] !== "";
    });
  };

  const transformData = (data: UserTemplate) => {
    const newLocations = [] as string[];
    if (data.location && data.location.length > 0) {
      data.location.forEach((i: Location) => newLocations.push(i.id));
    }
    delete data.location;
    return {
      ...data,
      location: newLocations,
    };
  };
  const handleEdit = async () => {
    const editKeys = Object.keys(initialDataState);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newData = editKeys.reduce((acc: any, curr: any) => {
      if (
        init[curr as keyof UserTemplate] !== edit[curr as keyof UserTemplate]
      ) {
        acc[curr] = edit[curr as keyof UserTemplate];
      }
      return acc;
    }, {});
    setDetailCardLoading(true);
    const req = (await updateUser(
      userId as string,
      transformData(newData),
      token as string
    )) as Response;
    setDetailCardLoading(false);
    if (req.state) {
      handleToast("success", "Usuario actualizado correctamente");
      setDetailCardTitle(edit.fullname);
      setInit(edit);
      setCanSubmit(false);
      setIsEdit(false);
      await fetchData(false);

    } else
      handleToast(
        "error",
        `Hubo un error actualizado usuario, Error: ${req?.message}`
      );
  };

  const handleSubmit = async () => {
    if (!isNewUser) {
      handleEdit();
      return;
    }
    setDetailCardLoading(true);
    const newData = transformUserToHandle(edit);
    const request = (await createUser(newData, token as string)) as Response;

    if (!request?.state) {
      handleToast(
        "error",
        `No fue posible crear Usuario, error: ${request.message}`
      );
    } else if (request.state) {
      router.push(`/users?userId=${request.data}`, { scroll: false });
      setInit(edit);
      setIsEdit(false);
      setDetailCardTitle(edit.fullname);
      handleToast("success", "usuario creado correctamente");
      await fetchData();
      setIsNewUser(false);
    }
    setDetailCardLoading(false);
  };

  const fetchData = async (loading: boolean = true) => {
    if (loading) setLoading(true);
    const req = await getUsers(token as string, 1, 5);
    if (req.state) {
      setUsers(req.data);
      setFilteredUsers(req.data);
    }
    setLoading(false);
  };

  const loadMore = async () => {
    const currentPage = page + 1;
    setPage(page + 1);
    setLoadingGlobal(true);
    const req = (await getUsers(token as string, currentPage, 5)) as Response;
    if (req.state) {
      //@ts-ignore
      if (req.data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUsers((prev) => [...prev, ...(req.data as any)]);
      } else {
        setCanLoadmore(false);
      }
    } else {
      handleToast("error", `Hubo un error, error ${req.message}`);
    }
    setLoadingGlobal(false);
  };

  const fetchLocations = async (userLocations?: Location[]) => {
    const req = (await getLocations(token as string, 1, 10)) as Response;
    if (req.state) {
      //@ts-ignore
      if (req.data.length > 0) {
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const locations = req.data.map((item: any) => ({
          label: item.title,
          value: item.locationId,
          isChecked: false,
        }));
        if (userLocations?.length === 0 || !userLocations) {
          setInitTemplate((prev) => ({
            ...prev,
            location: { ...prev.location, values: locations },
          }));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else
          setInitTemplate((prev: any) => {
            const merged = [...prev.location.values, ...locations];
            const unique = merged.reduce((acc, curr) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (!acc.some((item: any) => item.value === curr.value)) {
                acc.push(curr);
              }
              return acc;
            }, []);
            return {
              ...prev,
              location: {
                ...prev.location,
                values: unique,
              },
            };
          });
      }
    }
  };

  function handleNewUser() {
    setDetailCardState(!DetailCardCardState);
    fetchLocations();
    setIsNewUser(true);
    setEdit(initialDataState);
    setInit(initialDataState);
    router.push("/users/?newUser=true", { scroll: false });
    setDetailCardTitle("Nuevo Usuario");
  }

  const hideDetailCard = () => {
    setDetailCardState(!DetailCardCardState);
    router.push("/users", { scroll: false });
  };

  const locationLabel = (locations: Location[]) => {
    if (locations.length === 0) {
      return <label>Sin ubicaciones</label>;
    }
    if (locations.length > 1) {
      return (
        <label>{`${locations[0].name} mas ${locations.length - 1}`}</label>
      );
    }
    if (locations.length === 1) {
      return <label>{locations[0].name}</label>;
    }
  };

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
        isNewItem={isNewUser}
        detailCardOptions={detailOptions}
      />
      <div className="main-content">
        <h1 className="main-header">Usuarios</h1>

        <div className="primary-column">
          <button onClick={handleNewUser} className="primary-button">
            Agregar Nuevo
          </button>

          <input
            type="text"
            placeholder="Buscar usuario..."
            className="filter-input"
            value={filterValue}
            onChange={(e) => filterUsersByvalue(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">Nombre</th>
                <th className="">Tipo</th>
                <th className="">Estacionamientos</th>
                <th className="">Activo</th>
                <th className="">Creado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="">
                    Cargando...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className=""
                    onClick={() => getUserFromList(user.userId as string)}
                  >
                    <td className="">{user.fullname}</td>
                    <td className="">{user?.type} </td>
                    <td className="">
                      {locationLabel(user.location as Location[])}
                    </td>
                    <td className="">
                      <span className={` ${user.status ? "" : ""}`}>
                        {user.status ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="">{user.createdAt}</td>
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
      </div>
      {!loading && (
        <div className={styles["load-more-container"]}>
          {canLoadMore ? (
            <button className={styles["load-more-button"]} onClick={loadMore}>
              Cargar mas
            </button>
          ) : (
            filteredUsers.length === 0 &&
            page > 1 && <label>No hay más datos</label>
          )}
        </div>
      )}
    </>
  );
}
