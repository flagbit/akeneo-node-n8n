import { INodeExecutionData } from 'n8n-workflow';

export function changeToList(data: {}[]): INodeExecutionData[] {
	const out: INodeExecutionData[] = [];
	if (data) {
		data.forEach((item: object) => {
			out.push({ json: item } as INodeExecutionData);
		});
	}
	return out;
}
