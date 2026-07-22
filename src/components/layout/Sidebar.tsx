import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuthStore, selectUserRole } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";

const menuItemsByRole: Record<string, Array<{ path: string; label: string; icon: string }>> = {
    admin: [
        { path: "/dashboard", label: "Dashboard", icon: "mdi:view-dashboard" },
        { path: "/customers", label: "Clientes", icon: "mdi:account-group" },
        { path: "/products", label: "Productos", icon: "mdi:package-variant" },
        { path: "/inventario", label: "Inventario", icon: "mdi:warehouse" },
        { path: "/movimientos", label: "Movimientos", icon: "mdi:swap-horizontal" },
        { path: "/shipments", label: "Envíos", icon: "mdi:truck-delivery" },
    ],
    despacho: [
        { path: "/dashboard", label: "Dashboard", icon: "mdi:view-dashboard" },
        { path: "/movimientos", label: "Movimientos", icon: "mdi:swap-horizontal" },
        { path: "/shipments", label: "Envíos", icon: "mdi:truck-delivery" },
        { path: "/shipments/new", label: "Nuevo Envío", icon: "mdi:plus-circle" },
    ],
    produccion: [
        { path: "/inventario", label: "Inventario", icon: "mdi:warehouse" },
    ],
};

export const Sidebar = () => {
    const userRole = useAuthStore(selectUserRole);
    const sidebarOpen = useUIStore(s => s.sidebarOpen);
    const toggleSidebar = useUIStore(s => s.toggleSidebar);
    const mobileDrawerOpen = useUIStore(s => s.mobileDrawerOpen);
    const closeMobileDrawer = useUIStore(s => s.closeMobileDrawer);

    if (!userRole) return null;
    const menuItems = menuItemsByRole[userRole] || [];

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-40 flex-col ${sidebarOpen ? "w-64" : "w-16"}`}
            >
                <div className="flex items-center justify-between relative border-b border-gray-300 p-4 h-16">
                    <div className={`flex items-center ${sidebarOpen ? "" : "justify-center w-full"}`}>
                        <span className={`font-bold text-primary ${sidebarOpen ? "text-lg" : "text-xs"}`}>SDG</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-1 transition-all hover:bg-slate-100 absolute -right-6 border-t border-r border-b top-1/2 -translate-y-1/2 bg-white rounded-r-lg border-slate-200"
                    >
                        <Icon icon={sidebarOpen ? "mdi:chevron-left" : "mdi:chevron-right"} className="w-4 h-4" />
                    </button>
                </div>
                <nav className="p-2 flex-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`
                            }
                        >
                            <Icon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
                            <span
                                className={`text-sm font-medium truncate transition-opacity ${sidebarOpen ? "opacity-100" : "hidden"}`}
                            >
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Mobile drawer */}
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50 flex flex-col w-64 transform transition-transform duration-300 lg:hidden ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between border-b border-gray-300 p-4 h-16">
                    <span className="font-bold text-primary text-lg">Sistema de Gestión</span>
                    <button onClick={closeMobileDrawer} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Icon icon="mdi:close" className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-2 flex-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileDrawer}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`
                            }
                        >
                            <Icon icon={item.icon} className="w-5 h-5" />
                            <span className="text-sm font-medium truncate">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};
