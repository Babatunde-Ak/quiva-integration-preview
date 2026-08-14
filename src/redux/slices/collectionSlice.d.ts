import {AsyncThunk} from '@reduxjs/toolkit';

export interface CreateCollectionPayload {
    title : string;
    description?: string;
    bannerImage?: File;
    genre?: string[];
    collaborators?: any[];
    creatorDetails?: any;
}

export const createCollection : AsyncThunk < any,
    CreateCollectionPayload,
    any >;
export const getAllCollections : AsyncThunk < any,
    void,
    any >;
export const getUserCollections : AsyncThunk < any,
    void,
    any >;
export const getCollectionById : AsyncThunk < any, {
        id: string
    },
    any >;
export const updateCollection : AsyncThunk < any,
    any,
    any >;
export const deleteCollection : AsyncThunk < any, {
        id: string
    },
    any >;