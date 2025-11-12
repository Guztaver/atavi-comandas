"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MenuItem, Order, CartItem } from "@/types";
import { BetterAuthStorageService } from "@/lib/better-auth-storage";

export default function NewOrder() {
	const router = useRouter();
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [orderData, setOrderData] = useState({
		type: "dine-in" as "dine-in" | "delivery" | "takeout",
		customerName: "",
		customerPhone: "",
		customerAddress: "",
		tableNumber: "",
	});

	useEffect(() => {
		const loadMenuItems = async () => {
			const items = await BetterAuthStorageService.getMenuItems();
			setMenuItems(items);
		};
		loadMenuItems();
	}, []);

	const addToCart = (item: MenuItem) => {
		setCart((prev) => {
			const existingItem = prev.find((cartItem) => cartItem.id === item.id);
			if (existingItem) {
				return prev.map((cartItem) =>
					cartItem.id === item.id
						? { ...cartItem, quantity: cartItem.quantity + 1 }
						: cartItem,
				);
			}
			return [...prev, { ...item, quantity: 1, notes: "" }];
		});
	};

	const removeFromCart = (itemId: string) => {
		setCart((prev) => prev.filter((item) => item.id !== itemId));
	};

	const updateQuantity = (itemId: string, quantity: number) => {
		if (quantity <= 0) {
			removeFromCart(itemId);
		} else {
			setCart((prev) =>
				prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
			);
		}
	};

	const updateNotes = (itemId: string, notes: string) => {
		setCart((prev) =>
			prev.map((item) => (item.id === itemId ? { ...item, notes } : item)),
		);
	};

	const getTotal = () => {
		return cart.reduce((total, item) => total + item.price * item.quantity, 0);
	};

	const submitOrder = () => {
		if (cart.length === 0) {
			alert("Adicione itens ao pedido");
			return;
		}

		const orderItems = cart.map((item) => ({
			id: item.id,
			name: item.name,
			quantity: item.quantity,
			price: item.price,
			category: item.category,
			notes: item.notes || "",
		}));

		const order: Order = {
			id: Date.now().toString(),
			items: orderItems,
			total: getTotal(),
			status: "pending",
			type: orderData.type,
			customerName: orderData.customerName || undefined,
			customerPhone: orderData.customerPhone || undefined,
			customerAddress: orderData.customerAddress || undefined,
			tableNumber: orderData.tableNumber || undefined,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		BetterAuthStorageService.saveOrder(order);

		// Notificar sonoramente
		const audio = new Audio("/notification.mp3");
		audio.play().catch(() => {}); // Ignorar erro se o arquivo não existir

		router.push("/dashboard");
	};

	const menuByCategory = menuItems.reduce(
		(acc, item) => {
			if (!acc[item.category]) acc[item.category] = [];
			acc[item.category].push(item);
			return acc;
		},
		{} as Record<string, MenuItem[]>,
	);

	return (
		<div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900">Novo Pedido</h1>
				<p className="mt-1 text-sm text-gray-600">
					Adicione itens e finalize o pedido
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cardápio */}
				<div className="lg:col-span-2">
					<div className="bg-white shadow rounded-lg">
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
								Cardápio
							</h3>

							{Object.entries(menuByCategory).map(([category, items]) => (
								<div key={category} className="mb-8">
									<h4 className="text-md font-semibold text-gray-800 mb-4 capitalize">
										{category === "food"
											? "Pratos"
											: category === "drink"
												? "Bebidas"
												: "Sobremesas"}
									</h4>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{items.map((item) => (
											<div
												key={item.id}
												onClick={() => addToCart(item)}
												className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer active:scale-95 transform active:bg-red-100"
											>
												<div className="flex justify-between items-start mb-2">
													<h5 className="text-sm font-semibold text-gray-900">
														{item.name}
													</h5>
													<span className="text-sm font-bold text-green-600">
														R$ {item.price.toFixed(2)}
													</span>
												</div>
												{item.description && (
													<p className="text-xs text-gray-600 mb-3">
														{item.description}
													</p>
												)}
												<div className="flex items-center justify-between">
													<span className="text-xs text-gray-500">
														⏱️ {item.preparationTime} min
													</span>
													<div className="flex items-center text-xs text-red-600 font-medium">
														<span className="mr-1">+</span>
														<span>Adicionar</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Carrinho e Info do Pedido */}
				<div className="lg:col-span-1">
					<div className="space-y-6">
						{/* Informações do Pedido */}
						<div className="bg-white shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
									Informações do Pedido
								</h3>

								<div className="space-y-4">
									<div>
										<label
											htmlFor="order"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Tipo de Pedido
										</label>
										<select
											id="order"
											value={orderData.type}
											onChange={(e) =>
												setOrderData((prev) => ({
													...prev,
													type: e.target.value as any,
												}))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
										>
											<option value="dine-in">Mesa</option>
											<option value="delivery">Delivery</option>
											<option value="takeout">Viagem</option>
										</select>
									</div>

									{orderData.type === "dine-in" && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Número da Mesa
											</label>
											<input
												type="text"
												value={orderData.tableNumber}
												onChange={(e) =>
													setOrderData((prev) => ({
														...prev,
														tableNumber: e.target.value,
													}))
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
												placeholder="Ex: 01, 02, A1..."
											/>
										</div>
									)}

									{(orderData.type === "delivery" ||
										orderData.type === "takeout") && (
										<>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Nome do Cliente
												</label>
												<input
													type="text"
													value={orderData.customerName}
													onChange={(e) =>
														setOrderData((prev) => ({
															...prev,
															customerName: e.target.value,
														}))
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
													placeholder="Nome completo"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Telefone
												</label>
												<input
													type="tel"
													value={orderData.customerPhone}
													onChange={(e) =>
														setOrderData((prev) => ({
															...prev,
															customerPhone: e.target.value,
														}))
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
													placeholder="(00) 00000-0000"
												/>
											</div>

											{orderData.type === "delivery" && (
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Endereço de Entrega
													</label>
													<textarea
														value={orderData.customerAddress}
														onChange={(e) =>
															setOrderData((prev) => ({
																...prev,
																customerAddress: e.target.value,
															}))
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
														rows={3}
														placeholder="Rua, número, bairro..."
													/>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						</div>

						{/* Carrinho */}
						<div className="bg-white shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
									Itens do Pedido ({cart.length})
								</h3>

								{cart.length === 0 ? (
									<p className="text-gray-500 text-sm">
										Nenhum item adicionado
									</p>
								) : (
									<div className="space-y-3">
										{cart.map((item) => (
											<div
												key={item.id}
												className="py-3 border-b border-gray-100"
											>
												<div className="flex items-center justify-between mb-2">
													<div className="flex-1">
														<h5 className="text-sm font-medium text-gray-900">
															{item.name}
														</h5>
														<p className="text-xs text-gray-600">
															R$ {item.price.toFixed(2)}
														</p>
													</div>
													<div className="flex items-center space-x-2">
														<button
															onClick={() =>
																updateQuantity(item.id, item.quantity - 1)
															}
															className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center text-xs"
														>
															-
														</button>
														<span className="text-sm font-medium w-8 text-center">
															{item.quantity}
														</span>
														<button
															onClick={() =>
																updateQuantity(item.id, item.quantity + 1)
															}
															className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center text-xs"
														>
															+
														</button>
													</div>
												</div>
												<div className="mt-2">
													<input
														type="text"
														value={item.notes || ""}
														onChange={(e) =>
															updateNotes(item.id, e.target.value)
														}
														placeholder="Observações (ex: sem tomate, bem passado, etc.)"
														className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-red-500 focus:border-red-500"
														maxLength={100}
													/>
												</div>
											</div>
										))}

										<div className="pt-4 border-t border-gray-200">
											<div className="flex justify-between items-center mb-4">
												<span className="text-lg font-semibold text-gray-900">
													Total:
												</span>
												<span className="text-lg font-bold text-green-600">
													R$ {getTotal().toFixed(2)}
												</span>
											</div>

											<button
												onClick={submitOrder}
												className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
											>
												Finalizar Pedido
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
