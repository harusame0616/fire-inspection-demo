"use server";
import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import type { InspectionResult } from "./type";
import { headers } from "next/headers";
type InspectActionParams = {
	office: string;
	address: string;
	zoning: string;
	constructionType: string;
	totalFloorArea: number;
};

const inspectionSchema = z.object({
	automaticFireAlarmSystem: z.object({
		installationObligation: z.boolean(),
		basisOfJudgment: z.string(),
		installationStandard: z.string(),
		structureSpecification: z.string(),
	}),
});

export async function inspectAction({
	office,
	address,
	zoning,
	constructionType,
	totalFloorArea,
}: InspectActionParams) {
	console.dir(
		{
			params: {
				office,
				address,
				zoning,
				constructionType,
				totalFloorArea,
			},
			headers: Object.fromEntries((await headers()).entries()),
		},
		{
			depth: null,
		},
	);
	const openai = new OpenAI();

	const response = await openai.chat.completions.create({
		model: "gpt-4o",
		response_format: zodResponseFormat(inspectionSchema, "inspection"),
		temperature: 0,

		messages: [
			{
				role: "system",
				content: `あなたは日本の消防関連の法律に精通しています。ユーザーの報告を元に審査してください。
                結果は JSON 形式で出力してください

                ■ 消防法上必要な消防設備・管理制度（＋規格）
                1. 自動火災報知設備
                   1.1 設置義務のあり、無し
                   1.2 判定の根拠法令
                   1.3 設置基準
                   1.4 構造・性能規格

                出力例：
                {
                   "automaticFireAlarmSystem": {
                    "installationObligation": true,
                    "basisOfJudgment": "消防法施行令 第32条 第１項 第１号",
                    "installationStandard": "１項イ（病院等）で延べ面積300m²を超える場合に義務あり",
                    "structureSpecification": "消防法施行規則 第24条の2〜第26条、消防用設備等の技術上の基準（告示第34号）に基づき設置"
                   }
                }
                `,
			},
			{
				role: "user",
				content: `
                事務所名: ${office}
                住所: ${address}
                用途地域: ${zoning}
                工事種別: ${constructionType}
                延べ面積: ${totalFloorArea} ㎡
                `,
			},
		],
	});

	console.dir(response, { depth: null });

	return JSON.parse(
		response.choices[0].message.content ?? "{}",
	) as InspectionResult;
}
