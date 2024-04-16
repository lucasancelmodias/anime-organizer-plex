import axios from "axios";
import { getAccessTokenFromDB } from "./db";
import { type TokenResponse } from "./types";

//workaround for bun error 'bun zlib.createBrotliDecompress is not implemented' https://github.com/oven-sh/bun/issues/267#issuecomment-1854460357
axios.defaults.headers.common["Accept-Encoding"] = "gzip";
const anilistQuery = `query($name: String, $year: number){
    Media(search: $name, type: ANIME, seasonYear: $year) {
      idMal
      episodes
      title {
        romaji
        english
        native
        userPreferred
      }
    }
  }`;


export async function searchAnimeAnilist(name: string, year: number) : Promise<any>{

    if(typeof process.env.ANILIST_BASE_URL === "undefined") {
        throw new Error("Anilist base url is undefined");
    }
    const anilistURL = new URL(process.env.ANILIST_BASE_URL);

    try{
        const response = await axios.post(anilistURL.toString(), {
            query: anilistQuery,
            variables: {
                name,
                year
            }
        });
        //console.log(response);
        return { success: true , data: response.data.data.Media};
    }catch(error){
        
        return {success: false, error: error};
    }

}

export function generateAuthURL() : URL {

    if(typeof process.env.MAL_API_URL === "undefined") {
        throw new Error("Mal api url is undefined");
    }
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

export async function updateAnimeStatus(animeId: number, status: string, num_watched_episodes: string) : Promise<any> {
    const url = new URL(`/v2/anime/${animeId}/my_list_status`, process.env.MAL_BASE_URL);
    const token: TokenResponse = await getAccessTokenFromDB();
    const data = new URLSearchParams();
    data.append("status", status);
    data.append("num_watched_episodes", num_watched_episodes);
    const response = await axios.put(url.toString(), data, { headers: { 'Authorization': `Bearer ${token.access_token}` } });
    return response.data;
}