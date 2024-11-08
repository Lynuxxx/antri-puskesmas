import React, { useState } from "react";
import PatientTable from "./PatientTable.jsx";
import AddPatient from "./AddPatient.jsx";
import QueueList from "./QueueList.jsx";
import UsersData from "./UsersData.jsx";

const AdminDashboard = () => {
    const [menu, setMenu] = useState("dashboard");
    

    const handleMenu = (menu) => {
        setMenu(menu);
    };

    return (
        <div className="flex flex-row">
            <div className="flex items-center h-screen w-1/4">
                {/* <SideMenu></SideMenu> */}
                <div className="w-64 mt-36 fixed h-screen fixedflex flex-col jutify-center border">
                    <div className="p-4">
                        <h1 className="text-2xl font-bold">Menu</h1>
                    </div>
                    <nav className="flex-grow">
                        <ul className="space-y-2">
                            <li className="cursor-pointer">
                                <div
                                    onClick={() => handleMenu("dashboard")}
                                    className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-200 ${
                                        menu === "dashboard"
                                            ? "bg-slate-200"
                                            : ""
                                    }`}
                                >
                                    Dashboard
                                </div>
                            </li>
                            {/* <li className="cursor-pointer">
                                <div
                                    onClick={() =>
                                        handleMenu("registrasi-kunjungan")
                                    }
                                    className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-200 ${
                                        menu === "registrasi-kunjungan"
                                            ? "bg-slate-200"
                                            : ""
                                    }`}
                                >
                                    Registrasi Kunjungan
                                </div>
                            </li> */}
                            <li className="cursor-pointer">
                                <div
                                    onClick={() => handleMenu("daftar-pasien")}
                                    className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-200 ${
                                        menu === "daftar-pasien"
                                            ? "bg-slate-200"
                                            : ""
                                    }`}
                                >
                                    Daftar Pasien
                                </div>
                            </li>
                            <li className="cursor-pointer">
                                <div
                                    onClick={() => handleMenu("data-users")}
                                    className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-200 ${
                                        menu === "data-users"
                                            ? "bg-slate-200"
                                            : ""
                                    }`}
                                >
                                    Data Users
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            {menu === "dashboard" && (
                    <div  className="p-4 mt-36">
                        <QueueList />
                    </div>
                )}
            {/* {menu === "registrasi-kunjungan" && <AddPatient />} */}
            {menu === "daftar-pasien" && <PatientTable />}
            {menu === "data-users" && <UsersData />}
        </div>
    );
};

export default AdminDashboard;
