export type Token = {
    token: string;
    date: Date;
}

export type TokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}