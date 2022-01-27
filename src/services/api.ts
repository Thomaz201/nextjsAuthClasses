import axios, { AxiosError, HeadersDefaults } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

export interface CommonHeaderProperties extends HeadersDefaults {
  Authorization: string;
}

interface FailedRequestsQueueDTO {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}

type Context = undefined | GetServerSidePropsContext;

let isRefreshing = false;
let failedRequestsQueue: FailedRequestsQueueDTO[] = [];

export function setupApiClient(ctx: Context = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
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

          console.log('refresh');
          cookies = parseCookies(ctx);

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

                setCookie(ctx, 'nextauth.token', token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/',
                });

                setCookie(
                  ctx,
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
                failedRequestsQueue.forEach((request) =>
                  request.onFailure(err),
                );
                failedRequestsQueue = [];

                if (process.browser) {
                  signOut();
                }
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
        if (process.browser) {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
}
