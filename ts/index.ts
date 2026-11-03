// movie-editer とビューアがやりとりするデータの形（型は schema.json から作った types.ts）
export type * from './types';

/** data の形式の版。movie-editer の publish.py の SCHEMA と合わせる（movie_editer_schema/__init__.py の SCHEMA_VERSION） */
export const SCHEMA_VERSION = 2;
