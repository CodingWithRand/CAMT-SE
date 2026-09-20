export type Post = {
    id: string;
    user_id: string;
    content: any;
    category_id: string[];
    is_important?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type PostView = {
    id: string;
    author_name: string;
    content: any;
    is_important?: boolean;
    category: {
        name: string;
        description: string;
        priority: number;
    }[]; // after coalsces()
    media?: {
        url: string;
        type: string;
    }[]; // after coalsces()
    reaction_count: number;
    report_count: number;
    comment_count: number;
    engagement_score: number;
}

export type User = {
    id: string;
    cmu_account: string;
    display_name: string;
    email: string;
    is_cmu_p: boolean;
    is_mod: boolean;
    created_at?: Date;
}

export type Comment = {
    id?: string;
    parent_comment_id?: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at?: Date;
}

export type Report = {
    id?: string;
    post_id: string;
    user_id: string;
    reason: string;
    status: "Open" | "Reviewed" | "Dismissed";
    reviewed_by?: string;
    reviewed_at?: Date;
    created_at?: Date;
}