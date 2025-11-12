"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [redirectTimeout, setRedirectTimeout] = useState(false);
	const router = useRouter();
	const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();

	// Handle redirect after successful login
	useEffect(() => {
		if (isAuthenticated && user) {
			const redirectTimer = setTimeout(() => {
				// Redirect based on user role
				switch (user.role) {
					case 'admin':
						router.push('/dashboard');
						break;
					case 'kitchen':
						router.push('/kitchen');
						break;
					case 'delivery':
						router.push('/delivery');
						break;
					default:
						router.push('/dashboard');
				}
			}, 500); // Small delay to ensure session is fully established

			// Set a timeout to prevent infinite hanging
			const timeoutTimer = setTimeout(() => {
				setRedirectTimeout(true);
			}, 10000); // 10 second timeout

			return () => {
				clearTimeout(redirectTimer);
				clearTimeout(timeoutTimer);
			};
		}
	}, [isAuthenticated, user, router]);

	// Show loading spinner while checking authentication
	if (authLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
						<svg
							className="animate-spin h-8 w-8 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
					<p className="text-gray-600">Verificando autenticação...</p>
				</div>
			</div>
		);
	}

	// If authenticated but still on login page, show loading while redirect happens
	if (isAuthenticated) {
		if (redirectTimeout) {
			// Show error if redirect takes too long
			return (
				<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
							<svg
								className="h-8 w-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
					<p className="text-gray-600 mb-4">Tempo de redirecionamento excedido</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
					>
						Tentar novamente
					</button>
					</div>
				</div>
			);
		}

		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
						<svg
							className="animate-spin h-8 w-8 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
					<p className="text-gray-600">Redirecionando...</p>
				</div>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const result = await login(email, password);

		if (!result.success) {
			setError(result.error || "Erro ao fazer login");
		}

		setIsLoading(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
						<svg
							className="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-gray-900">Atavi Comandas</h1>
					<p className="text-gray-600 mt-2">Sistema de Gerenciamento</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							E-mail
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
							placeholder="Digite seu e-mail"
							required
							autoComplete="email"
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Senha
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
							placeholder="Digite sua senha"
							required
							autoComplete="current-password"
						/>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isLoading ? "Entrando..." : "Entrar"}
					</button>
				</form>
			</div>
		</div>
	);
}
