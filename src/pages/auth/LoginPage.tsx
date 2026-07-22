import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/api/client";
import { useAuthStore } from "@/store/auth.store";
import type { LoginRequest } from "@/types/auth.types";
import { useState } from "react";

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Contraseña requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const setTokens = useAuthStore(s => s.setTokens);
    const setUser = useAuthStore(s => s.setUser);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await authApi.login(data as LoginRequest);
            const { access_token, refresh_token, user } = response.data;
            setTokens(access_token, refresh_token);
            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
            const redirectByRole = { admin: "/dashboard", despacho: "/dashboard", produccion: "/inventario" };
            navigate(redirectByRole[user.role] || "/dashboard");
        } catch {
            setError("password", { message: "Credenciales inválidas" });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-3">
                        <span className="text-white font-bold text-xl">SDG</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Sistema de Gestión</h1>
                    <p className="text-sm text-slate-500">Ingresa a tu cuenta</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <Icon
                                icon="mdi:email-outline"
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                            />
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Icon
                                icon="mdi:lock-outline"
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                            />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                        {errors.password && <p className="mt-1.5 text-xs text-error">{errors.password.message}</p>}
                    </div>
                    <Button type="submit" loading={isSubmitting} className="w-full">
                        Iniciar Sesión
                    </Button>
                </form>
                <div className="mt-6 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium mb-2">Cuentas de prueba (Demo):</p>
                    <div className="space-y-1 text-xs text-slate-600">
                        <p>
                            <strong>Admin:</strong> admin@demo.com / admin123
                        </p>
                        <p>
                            <strong>Despacho:</strong> despacho@demo.com / despacho123
                        </p>
                        <p>
                            <strong>Producción:</strong> produccion@demo.com / produccion123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
