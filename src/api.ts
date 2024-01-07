import axios from "axios";
import { getAccessTokenFromDB } from "./db";
import { type TokenResponse } from "./types";



export function generateAuthURL() : URL {

    //build the url using values from .env file
    let url = new URL("/v1/oauth2/authorize?response_type=code", process.env.MAL_API_URL);

    //add the client id
    if(typeof process.env.MAL_CLIENT_ID === "undefined") {
        throw new Error("Client ID is undefined");
    }
    url.searchParams.append("client_id", process.env.MAL_CLIENT_ID);

    //add the client secret
    if(typeof process.env.MAL_CLIENT_SECRET === "undefined") {
        throw new Error("Client secret is undefined");
    }
    url.searchParams.append("client_secret", process.env.MAL_CLIENT_SECRET);
    //add code challenge
    if(typeof process.env.MAL_CODE_CHALLENGE === "undefined") {
        throw new Error("Code challenge is undefined");
    }
    url.searchParams.append("code_challenge", process.env.MAL_CODE_CHALLENGE);
    console.log("generated url");
    console.log(url.toString());

    return url;

}

export async function getAccessToken(code: string) : Promise<TokenResponse> {

    const url = new URL("/v1/oauth2/token ", process.env.MAL_API_URL);
    if(typeof process.env.MAL_CLIENT_ID === "undefined") {
        throw new Error("Client ID is undefined");
    }
    if(typeof process.env.MAL_CLIENT_SECRET === "undefined") {
        throw new Error("Client secret is undefined");
    }
    if(typeof process.env.MAL_CODE_CHALLENGE === "undefined") {
        throw new Error("Code challenge is undefined");
    }
    const data = new URLSearchParams();
    data.append("grant_type", "authorization_code");
    data.append("client_id", process.env.MAL_CLIENT_ID);
    data.append("client_secret", process.env.MAL_CLIENT_SECRET);
    data.append("code", code);
    data.append("code_verifier", process.env.MAL_CODE_CHALLENGE);

    const response = await axios.post(url.toString(), data);
    console.log(response.data);
    return response.data;
}


export async function searchAnime(query: string) : Promise<any> {
    const url = new URL("/v2/anime?", process.env.MAL_BASE_URL);
    console.log("searching anime");
    const token: TokenResponse = await getAccessTokenFromDB();
    
    url.searchParams.append("q", query);
    url.searchParams.append("limit", "10");
    const response = await axios.get(url.toString(), { headers: { 'Authorization': `Bearer ${token.access_token}` } });

    return response.data;
}

export async function refreshToken(): Promise<TokenResponse>{

    const url = new URL("/v1/oauth2/token", process.env.MAL_API_URL);
    if(typeof process.env.MAL_CLIENT_ID === "undefined") {
        throw new Error("Client ID is undefined");
    }
    if(typeof process.env.MAL_CLIENT_SECRET === "undefined") {
        throw new Error("Client secret is undefined");
    }
    if(typeof process.env.MAL_CODE_CHALLENGE === "undefined") {
        throw new Error("Code challenge is undefined");
    }
    const token: TokenResponse = await getAccessTokenFromDB();
    const data = new URLSearchParams();
    data.append("grant_type", "refresh_token");
    data.append("client_id", process.env.MAL_CLIENT_ID);
    data.append("client_secret", process.env.MAL_CLIENT_SECRET);
    data.append("refresh_token", token.refresh_token);

    const response = await axios.post(url.toString(), data);
    console.log(response.data);
    return response.data;
}