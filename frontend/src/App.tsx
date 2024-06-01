import { ChangeEvent, FormEvent, useState } from 'react';
import './App.css';
import { uploadFile } from './services/upload';
import { Toaster, toast } from 'sonner';
import { type Data } from './types/upload.type';
import { Search } from './steps/Search';
import logo from './assets/img/excel-and-csv.png'; // Adjust the path according to your project structure

const APP_STATUS = {
    IDLE: 'idle',
    ERROR: 'error',
    UPLOADING: 'uploading',
    READY_UPLOAD: 'ready_upload',
    READY_USAGE: 'ready_usage',
} as const;

const BUTTON_TEXT = {
    [APP_STATUS.READY_UPLOAD]: 'Subir archivo',
    [APP_STATUS.UPLOADING]: 'Subiendo...',
};

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

const App = (): JSX.Element => {
    const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
    const [data, setData] = useState<Data>([]);
    const [file, setFile] = useState<File | null>(null);

    const handleInputChnage = (event: ChangeEvent<HTMLInputElement>): void => {
        const [file] = event.target.files ?? [];

        if (file) {
            setFile(file);
            setAppStatus(APP_STATUS.READY_UPLOAD);
        }
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();
        if (appStatus !== APP_STATUS.READY_UPLOAD || !file) {
            return;
        }
        setAppStatus(APP_STATUS.UPLOADING);

        const [err, newData] = await uploadFile(file);
        if (err) {
            setAppStatus(APP_STATUS.ERROR);
            toast.error(err.message);
        }
        setAppStatus(APP_STATUS.READY_USAGE);
        if (newData) setData(newData);
        toast.success('Archivo subido correctamente');
    };

    const showButton =
        appStatus === APP_STATUS.READY_UPLOAD ||
        appStatus === APP_STATUS.UPLOADING;

    const showInput = appStatus !== APP_STATUS.READY_USAGE;

    return (
        <>
            <Toaster />
            <div className="flex items-center justify-center flex-col">
                <img src={logo} alt="logo csv" />
                <h4 className="mb-5">Subir Archivo CSV + Realizar Búsqueda</h4>
                {showInput && (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col justify-center items-center gap-5">
                            <input
                                disabled={appStatus === APP_STATUS.UPLOADING}
                                onChange={handleInputChnage}
                                name="file"
                                type="file"
                                accept=".csv"
                            />
                            {showButton && (
                                <button
                                    disabled={
                                        appStatus === APP_STATUS.UPLOADING
                                    }
                                >
                                    {BUTTON_TEXT[appStatus]}
                                </button>
                            )}
                        </div>
                    </form>
                )}
                {appStatus === APP_STATUS.READY_USAGE && (
                    <Search initialData={data} />
                )}
            </div>
        </>
    );
};

export default App;
