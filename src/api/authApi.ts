export const GET = 'GET';
export const POST = 'POST';
export const DELETE = 'DELETE';
export const PATCH = 'PATCH';

export const headersDefault = { "Content-Type": "application/json" };
export const LOCALHOST =  process.env?.NEXT_PUBLIC_IS_LOCAL === "true" ?  process.env.NEXT_PUBLIC_LOCAL_URL :  process.env.NEXT_PUBLIC_API_URL 
interface OptionsInterface extends RequestInit {
    timeout?: number;
    external?:boolean
}
interface Response {
    state: boolean
    message: string
    data: string[]
    limit?: number
    page?: number
    total?: number
}

interface INewPassword {
    email:string;
    temporalPassword:string;
    newPassword: string;
}

export async function  fetchWithTimeout(url:string, options:OptionsInterface) {
    const { timeout = 10000, ...otherOptions } = options;

    try
    {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        
        const request = await fetch(url, {
            ...otherOptions,
            signal: controller.signal
        });
        clearTimeout(timer);
        return request.json() as unknown | Response;
    } catch(err) {
        throw err
    }
}


export async function loginService(email: string, password: string) {
    const body =  JSON.stringify({email, password});
    const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/login`,{
        method:POST,
        headers: headersDefault,
        body
    });
    return request;
}

export async function validateAuthenticatorCode(email:string, otp:string){
    const body = JSON.stringify({email, otp});
    const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/validate2f`, {
        method: POST,
        headers: headersDefault, 
        body
    });
    return request;
}

export async function validateToken(token:string) {
        const headerToken = {
            ...headersDefault,
            Authorization: `Bearer ${token}`
        }
        const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/validate_token`, {
            method:GET,
            headers:headerToken
        })

        return request;
}
export async function validateUrlFromChangePasswordPage(tempToken:string, requestId:string ) {
    const headersInit = {
        temporalToken: tempToken,
        userId: requestId
    };

    const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/checkPasswordChangeUrl`, {
        method: GET,
        headers: {
            ...headersDefault,
            ...headersInit
        }
    })
    return request;
}

export async function submitNewPassword(tempToken:string, requestId:string, data: INewPassword ) {
    const headersInit = {
        temporalToken: tempToken,
        userId: requestId
    };
    const payload = JSON.stringify(data);

    const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/changePasswordWithTemporal`, {
        method: POST,
        headers: {
            ...headersDefault,
            ...headersInit
        },
        body: payload
        
    })
    return request;
}
export async function requestPasswordReset(email:string ) {

    const payload = JSON.stringify({email});

    const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/recoverPassword`, {
        method: POST,
        headers: {
            ...headersDefault,
        },
        body: payload
        
    })
    return request;
}