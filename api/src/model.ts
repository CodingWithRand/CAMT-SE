/** Rows the API writes, as they are in the database. */

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
    reviewed_by?: string | null;
    reviewed_at?: Date | null;
    created_at?: Date;
}
