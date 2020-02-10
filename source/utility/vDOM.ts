import { VNodeChildElement } from 'snabbdom/src/h';

export function Fragment({
    defaultSlot
}: {
    defaultSlot?: VNodeChildElement[];
}) {
    return defaultSlot;
}

type LanguageMap<T> = {
    [K in keyof T]: string;
};

interface I18nData<T> {
    [language: string]: () => Promise<LanguageMap<T>>;
}

export function createI18nScope<T = {}>(
    data: I18nData<T>,
    defaultLanguage: string
) {
    var map: LanguageMap<T> | null = null;

    return {
        loaded: (async () => {
            for (const name of new Set(
                navigator.languages.concat(defaultLanguage)
            ))
                try {
                    if ((map = await data[name]?.())) break;
                } catch (error) {
                    console.error(error);
                }

            if (!map) throw Error('No available I18n data');
        })(),
        i18nTextOf: (key: keyof T) => map?.[key]
    };
}
