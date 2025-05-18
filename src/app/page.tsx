"use client";

import * as v from "valibot";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ConstructionType, type InspectionResult } from "./type";
import { inspectAction } from "./inspect";
import { useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const inputSchema = v.object({
	office: v.string(),
	address: v.string(),
	zoning: v.string(),
	constructionType: v.enum(ConstructionType),
	totalFloorArea: v.pipe(v.string(), v.transform(Number), v.number()),
});

export default function Home() {
	const [inspectionResult, setInspectionResult] =
		useState<InspectionResult | null>(null);
	const form = useForm({
		resolver: valibotResolver(inputSchema),
	});

	const onSubmit = async (data: v.InferOutput<typeof inputSchema>) => {
		const result = await inspectAction(data);
		setInspectionResult(result);
	};

	return (
		<div className="p-4 grid grid-cols-5 gap-4 h-full">
			<Card className="col-span-2">
				<CardHeader>申請内容</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							className="flex flex-col gap-4"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<FormField
								control={form.control}
								name="office"
								render={({ field }) => (
									<FormItem>
										<FormLabel>事務所名</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>住所</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="zoning"
								render={({ field }) => (
									<FormItem>
										<FormLabel>用途地域</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="constructionType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>工事種別</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className="flex flex-col gap-1"
											>
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem value={ConstructionType.New} />
													</FormControl>
													<FormLabel className="font-normal">新築</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem
															value={ConstructionType.Extension}
														/>
													</FormControl>
													<FormLabel className="font-normal">増築</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem
															value={ConstructionType.Reconstruction}
														/>
													</FormControl>
													<FormLabel className="font-normal">改築</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem
															value={ConstructionType.ChangeOfUse}
														/>
													</FormControl>
													<FormLabel className="font-normal">
														用途変更
													</FormLabel>
												</FormItem>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="totalFloorArea"
								render={({ field }) => (
									<FormItem>
										<FormLabel>延べ面積（㎡）</FormLabel>
										<FormControl>
											<Input {...field} type="number" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit">審査する</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
			<Card className="col-span-3">
				<CardHeader>審査結果</CardHeader>
				<CardContent>
					{form.formState.isSubmitting ? (
						<div className="flex items-center justify-center">
							<RotateCw className="w-4 h-4 animate-spin" />
						</div>
					) : (
						<div className="flex flex-col gap-2">
							<div>
								<h2>自動火災報知機</h2>
								<ul>
									<li>
										設置義務：
										{inspectionResult?.automaticFireAlarmSystem
											.installationObligation
											? "あり"
											: "なし"}
									</li>
									<li>
										判定の根拠法令：
										{inspectionResult?.automaticFireAlarmSystem.basisOfJudgment}
									</li>
									<li>
										設置基準：
										{
											inspectionResult?.automaticFireAlarmSystem
												.installationStandard
										}
									</li>
									<li>
										構造・性能規格：
										{
											inspectionResult?.automaticFireAlarmSystem
												.structureSpecification
										}
									</li>
								</ul>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
