import axios, { AxiosError, HeadersDefaults } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

export interface CommonHeaderProperties extends HeadersDefaults {
  Authorization: string;
}

interface FailedRequestsQueueDTO {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: FailedRequestsQueueDTO[] = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        // renovar o token
        cookies = parseCookies();

        const { 'nextauth.refreshToken': refreshToken } = cookies;

        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post('refresh', {
              refreshToken,
            })
            .then((response) => {
              const { token } = response.data;

              setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
              });

              setCookie(
                undefined,
                'nextauth.refreshToken',
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/',
                },
              );

              api.defaults.headers = {
                Authorization: `Bearer ${token}`,
              } as CommonHeaderProperties;

              failedRequestsQueue.forEach((request) =>
                request.onSuccess(token),
              );
              failedRequestsQueue = [];
            })
            .catch((err: AxiosError) => {
              failedRequestsQueue.forEach((request) => request.onFailure(err));
              failedRequestsQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers!['Authorization'] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      }
      // deslogar usario caso tenhamos erro 401 e o token não está expirado
      signOut();
    }

    return Promise.reject(error);
  },
);
