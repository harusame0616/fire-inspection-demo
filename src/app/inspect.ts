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
	officeType: string;
	totalFloorArea: number;
};

const inspectionSchema = z.object({
	automaticFireAlarmSystem: z.object({
		installationObligation: z.boolean(),
		basisOfJudgment: z.string(),
		installationStandard: z.string(),
		officeType: z.string(),
		structureSpecification: z.string(),
	}),
});

export async function inspectAction({
	office,
	address,
	zoning,
	officeType,
	constructionType,
	totalFloorArea,
}: InspectActionParams) {
	console.log(
		JSON.stringify(
			{
				params: {
					office,
					address,
					zoning,
					officeType,
					constructionType,
					totalFloorArea,
				},
				headers: Object.fromEntries((await headers()).entries()),
			},
			null,
			4,
		),
	);
	const openai = new OpenAI();

	const response = await openai.chat.completions.create({
		model: "gpt-4.1",
		response_format: zodResponseFormat(inspectionSchema, "inspection"),
		temperature: 0,
		top_p: 0.1,
		messages: [
			{
				role: "system",
				content: `
                用途分類
具体的な施設例
設置義務が生じる延べ面積
劇場・映画館等
劇場、映画館、演芸場、観覧場、公会堂、集会場
300㎡以上
遊興施設
キャバレー、カフェー、ナイトクラブ、遊技場、ダンスホール、カラオケボックス等
300㎡以上
飲食店
待合、料理店、飲食店（レストラン、喫茶店等）
300㎡以上
物販店舗
百貨店、マーケット、物品販売店舗、展示場等
300㎡以上
宿泊施設
旅館、ホテル、宿泊所等
延べ面積に関係なく全て
共同住宅等
寄宿舎、下宿、共同住宅
500㎡以上
医療施設
病院、有床診療所、有床助産所
延べ面積に関係なく全て
無床診療所等
無床診療所、無床助産所
300㎡以上
福祉施設等
老人ホーム、救護施設、乳児院、障害者支援施設等
延べ面積に関係なく全て
保育・教育施設
保育所、幼稚園、特別支援学校、小学校、中学校、高等学校、大学等
300㎡以上（一部500㎡以上）
図書館等
図書館、博物館、美術館等
500㎡以上
公衆浴場
蒸気浴場、熱気浴場等
200㎡以上
一般浴場
銭湯、岩盤浴場等
500㎡以上
交通施設
駅、バスターミナル等（旅客の乗降・待合用）
500㎡以上
宗教施設
神社、寺院、教会等
1,000㎡以上
工場・作業場
工場、作業場、映画・テレビスタジオ等
500㎡以上
車庫・駐車場
自動車車庫、駐車場、航空機の格納庫等
500㎡以上
倉庫
倉庫
500㎡以上
事務所等
事務所、銀行、理容室、美容室等
1,000㎡以上
複合用途防火対象物
複数の用途が混在する建物
300㎡以上（特定用途部分が延べ面積の10％超の場合）
地下街
地下街
延べ面積に関係なく全て
準地下街
地下道に面した建築物の地階部分
延べ面積に関係なく全て
文化財
重要文化財等
延べ面積に関係なく全て

                あなたは日本の消防関連の法律に精通しています。ユーザーの報告を元に審査してください。
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
                    "basisOfJudgment": "◯ 第◯条 第◯項 第◯号",
                    "installationStandard": "◯項◯（◯）で◯◯◯の場合に設置義務あり",
                    "structureSpecification": "◯ 第◯条の◯〜第◯条、◯◯◯◯（告示第◯号）に基づき設置"
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
                用途: ${officeType}
                工事種別: ${constructionType}
                延べ面積: ${totalFloorArea} ㎡
                `,
			},
		],
	});

	console.log(JSON.stringify(response, null, 4));

	return JSON.parse(
		response.choices[0].message.content ?? "{}",
	) as InspectionResult;
}
