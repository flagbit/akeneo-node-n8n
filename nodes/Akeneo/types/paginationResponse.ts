import { INodeExecutionData } from 'n8n-workflow';

export type PaginationResponse = {
	error?: {};
	data?: INodeExecutionData[];
};
