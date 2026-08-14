// Type definitions
export interface Creator {
    _id : string;
    walletAddress : string;
    avatar?: string;
    username?: string;
}

export interface Comic {
    _id : string;
    title : string;
    bannerImage : string;
    maturityRating : string;
    summary : string;
    totalPages : number;
}
export interface ApiCollection {
    _id : string;
    title : string;
    description : string;
    genre : string[];
    bannerImage : string;
    bannerCid : string;
    isDeleted : boolean;
    creatorId : Creator;
    comic : Comic[];
    createdAt : string;
    updatedAt : string;
    __v : number;
}

export interface MappedCollection {
    id : string;
    title : string;
    description : string;
    coverImage : string;
    episodes : Array < {
        id: string;
        thumbnail: string;
        maturityRating : string;
        title : string;
        totalPages : number;
        summary : string;
    } >;
    totalEpisodes : number;
}

// Mapping function
export const mapApiCollectionsToMockFormat = (apiCollections : ApiCollection[]) : MappedCollection[] => {
    return apiCollections.map(collection => ({
        id: collection._id,
        title: collection.title,
        description: collection.description,
        coverImage: collection.bannerImage,
        episodes: collection
            .comic
            .map(comic => ({
                id: comic._id, 
                thumbnail: comic.bannerImage,
                maturityRating: comic.maturityRating,
                title: comic.title,
                totalPages: comic.totalPages,
                summary: comic.summary
            })),
        totalEpisodes: collection.comic.length
    }));
};

// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};