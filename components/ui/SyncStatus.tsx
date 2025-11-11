"use client";

import { useState, useEffect } from "react";
import { SyncService } from "@/lib/sync";

export default function SyncStatus() {
	const [status, setStatus] = useState(SyncService.getSyncStatus());

	useEffect(() => {
		const updateStatus = () => {
			setStatus(SyncService.getSyncStatus());
		};

		// Atualizar status a cada 5 segundos
		const interval = setInterval(updateStatus, 5000);

		// Listener para mudanças de conexão
		const handleOnline = () => updateStatus();
		const handleOffline = () => updateStatus();

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			clearInterval(interval);
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	const formatLastSync = (date: Date | null) => {
		if (!date) return "Nunca";
		const now = new Date();
		const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diff < 60) return "Agora";
		if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`;
		return date.toLocaleDateString("pt-BR");
	};

	return (
		<div className="fixed bottom-4 right-4 z-50">
			<div
				className={`px-3 py-2 rounded-lg shadow-lg text-xs font-medium ${
					status.isOnline
						? "bg-green-100 text-green-800 border border-green-200"
						: "bg-red-100 text-red-800 border border-red-200"
				}`}
			>
				<div className="flex items-center space-x-2">
					<div
						className={`w-2 h-2 rounded-full ${
							status.isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
						}`}
					/>
					<span>{status.isOnline ? "Online" : "Offline"}</span>

					{status.isOnline && status.pendingSyncs > 0 && (
						<>
							<span>•</span>
							<span className="text-yellow-600">
								{status.pendingSyncs} pendente(s)
							</span>
						</>
					)}

					{status.isOnline && status.lastSync && (
						<>
							<span>•</span>
							<span className="text-gray-600">
								Última sincronização: {formatLastSync(status.lastSync)}
							</span>
						</>
					)}
				</div>

				{status.syncInProgress && (
					<div className="mt-1 text-center">
						<div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
					</div>
				)}
			</div>
		</div>
	);
}
