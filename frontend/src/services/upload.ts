import { ApiUploadResponse, type Data } from '../types/upload.type';
import { API_HOST } from '../config';

export const uploadFile = async (file: File): Promise<[Error?, Data?]> => {
    const formData = new FormData();
    formData.append('file', file);
    console.log('API_HOST1 ', API_HOST);
    console.log('API_HOST2 ', process.env.API_HOST);
    try {
        const response = await fetch(`${process.env.API_HOST}/api/files`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok)
            return [new Error(`Error uploading file: ${response.statusText}`)];
        const json = (await response.json()) as ApiUploadResponse;
        return [undefined, json.data];
    } catch (error) {
        if (error instanceof Error) return [error];
    }

    return [new Error('Unknown error')];
};
