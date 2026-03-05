// Root response
export interface ProthomAloCollectionResponse {
    "updated-at": number;
    "collection-cache-keys": string[];
    slug: string;
    fallback: boolean;
    name: string;
    "data-source": string;
    automated: boolean;
    template: string;
    rules: {
        fields: string;
        "content-type": string;
        q: string;
        message: string;
        "story-template": string;
        "updated-at": string;
        id: number;
        "collection-id": number;
        "section-id": string;
    };
    summary: null;
    id: number;
    "total-count": number;
    "collection-date": null | string;
    items: CollectionItem[];
}

// Each item in the collection
export interface CollectionItem {
    id: string;
    score: number | null;
    type: string;
    item: {
        headline: string[];
    };
    story: Story;
}

// The detailed story object
export interface Story {
    "updated-at": number;
    "published-at"?: number;
    "first-published-at"?: number;
    seo: {
        "meta-keywords": string[];
        "meta-description": string;
        "claim-reviews": {
            story: null | any;
        };
    };
    "assignee-id": number;
    "author-name": string;
    headline?: string[];
    slug?: string;
    url?: string;
    tags: Tag[];
}

// Tag objects
export interface Tag {
    properties: {
        images: any[];
        "meta-title"?: string;
        "meta-description"?: string | null;
        "external-id"?: string | null;
        "tag-description"?: string | null;
    };
    slug: string;
    name: string;
    type: string;
    "tag-type": string;
    "entity-type-id"?: number;
    "external-id"?: string | null;
    id: number;
}
