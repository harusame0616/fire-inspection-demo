"use server";
import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import type { InspectionResult } from "./type";
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
	const openai = new OpenAI();

	const response = await openai.chat.completions.create({
		model: "gpt-4o",
		response_format: zodResponseFormat(inspectionSchema, "inspection"),

		messages: [
			{
				role: "system",
				content: `あなたは日本の消防関連の法律に精通しています。ユーザーからの報告を元に以下を審査してください。
                報告は JSON 形式で行ってください

                ■ 消防法上必要な消防設備・管理制度（＋規格）
                1. 自動火災報知設備
                   1.1 設置義務のあり、無し
                   1.2 判定の根拠法令（例：消防法施行令 第32条 第１項 第１号）
                   1.3 設置基準（例：１項イ（病院等）で述べ面積301m²以上 → 義務あり
                   1.4 構造・・性能規格：消防法施行規則 第24条〜第26条、消防用設備等の技術上の基準（告示第３４号）
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
