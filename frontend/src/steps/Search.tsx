import { ChangeEvent, useEffect, useState } from 'react';
import { Data } from '../types/upload.type';
import { searchData } from '../services/search';
import { toast } from 'sonner';
import { useDebounce } from '@uidotdev/usehooks';

const DEBOUNCE_TIME = 300;

export const Search = ({ initialData }: { initialData: Data }): JSX.Element => {
    const [data, setData] = useState<Data>(initialData);
    const [search, setSearch] = useState<string>((): string => {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get('q') ?? '';
    });

    const debouncedSearch = useDebounce(search, DEBOUNCE_TIME);

    const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
        setSearch(event.target.value);
    };

    useEffect((): void => {
        const newPathname =
            debouncedSearch === ''
                ? window.location.pathname
                : `?q=${debouncedSearch}`;
        window.history.replaceState({}, '', newPathname);
    }, [debouncedSearch]);

    useEffect((): void => {
        if (!debouncedSearch) {
            setData(initialData);
            return;
        }
        searchData(debouncedSearch).then((response) => {
            const [err, newData] = response;

            if (err) {
                toast.error(err.message);
                return;
            }

            if (newData) setData(newData);
        });
    }, [debouncedSearch, initialData]);

    return (
        <>
            <input
                onChange={handleSearch}
                type="search"
                placeholder="Buscar información..."
                className="mb-7 block py-1.5 px-5 ring-1 ring-gray-300 placeholder:text-gray-400"
            />
            {data.length > 0 ? (
                <table className="border-collapse table-auto w-full text-sm">
                    <thead>
                        <tr>
                            {Object.keys(data[0]).map(
                                (key: string): JSX.Element => (
                                    <th
                                        key={key}
                                        className="border-b border-slate-600 p-3 font-bold text-slate-200"
                                    >
                                        {key}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(
                            (item: Record<string, string>): JSX.Element => (
                                <tr key={item.id}>
                                    {Object.values(item).map(
                                        (value: string): JSX.Element => (
                                            <td
                                                key={value}
                                                className="border-b border-slate-600 font-medium p-3 text-slate-200"
                                            >
                                                {value}
                                            </td>
                                        )
                                    )}
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            ) : (
                <p>No hay información</p>
            )}
        </>
    );
};
