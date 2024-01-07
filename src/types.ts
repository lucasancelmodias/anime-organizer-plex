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

export enum Status{
	WATCHING = 'watching',
	COMPLETED = 'completed',
	ON_HOLD = 'on_hold',
	DROPPED = 'dropped',
	PLAN_TO_WATCH = 'plan_to_watch'
}