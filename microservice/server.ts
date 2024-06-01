import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import csvToJson from 'convert-csv-to-json';

const app = express();
const port = process.env.PORT ?? 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage });

let jsonCsv: Array<Record<string, string>> = [];

app.use(cors());

app.post(
    '/api/files',
    upload.single('file'),
    async (req: Request, res: Response): Promise<Response> => {
        const { file } = req;

        if (!file) {
            return res.status(500).json({ message: 'File is required' });
        }

        if (file.mimetype !== 'text/csv') {
            return res.status(500).json({ message: 'File must be CSV' });
        }
        try {
            const rawCsv = Buffer.from(file.buffer).toString('utf-8');
            jsonCsv = csvToJson.fieldDelimiter(',').csvStringToJson(rawCsv);
        } catch (error) {
            return res.status(500).json({ message: 'Error parsing the file' });
        }

        return res.status(200).json({
            data: jsonCsv,
            message: 'El archivo se cargó correctamente',
        });
    }
);

app.get(
    '/api/users',
    async (req: Request, res: Response): Promise<Response> => {
        const { q } = req.query;
        if (!q) {
            return res
                .status(500)
                .json({ message: 'Query param `q` is required' });
        }

        const search = q.toString().toLowerCase();

        const filteredData = jsonCsv.filter(
            (row: Record<string, string>): boolean =>
                Object.values(row).some((value: string): boolean =>
                    value.toLowerCase().includes(search)
                )
        );

        return res.status(200).json({
            data: filteredData,
        });
    }
);

app.listen(port, (): void =>
    console.log(`Server is running at http://localhost:${port}`)
);
